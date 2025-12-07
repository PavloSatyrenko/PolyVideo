import { computed, inject, Injectable, Signal, signal, WritableSignal } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { environment } from "@shared/environments/environment";
import { RemotePeerType } from "@shared/types/RemotePeerType";
import { MeetingsService } from "./meetings.service";
import { MeetingType } from "@shared/types/MeetingType";
import { MessageType } from "@shared/types/MessageType";
import { Router } from "@angular/router";
import { AuthService } from "./auth.service";
import { NotificationService } from "./notification.service";

@Injectable({
    providedIn: "root"
})
export class ConferenceWebsocket {
    private socket!: Socket;

    protected isReconnecting: WritableSignal<boolean> = signal<boolean>(false);

    private peerConnections: Record<string, RTCPeerConnection> = {};
    private screenSenderPeerConnections: Record<string, RTCPeerConnection> = {};
    private screenReceiverPeerConnections: Record<string, RTCPeerConnection> = {};

    public localName: WritableSignal<string> = signal<string>("");

    public isJoining: WritableSignal<boolean> = signal<boolean>(false);
    public isConnected: WritableSignal<boolean> = signal<boolean>(false);

    private internalLocalVideoTrigger: WritableSignal<number> = signal(0);
    private internalLocalVideoStream: WritableSignal<MediaStream> = signal(new MediaStream());
    public localVideoStream: Signal<MediaStream> = computed<MediaStream>(() => {
        this.internalLocalVideoTrigger();
        return this.internalLocalVideoStream();
    });

    private internalLocalAudioTrigger: WritableSignal<number> = signal(0);
    private internalLocalAudioStream: WritableSignal<MediaStream> = signal(new MediaStream());
    public localAudioStream: Signal<MediaStream> = computed<MediaStream>(() => {
        this.internalLocalAudioTrigger();
        return this.internalLocalAudioStream();
    });

    private internalLocalScreenShareTrigger: WritableSignal<number> = signal(0);
    private internalLocalScreenShareStream: WritableSignal<MediaStream> = signal(new MediaStream());
    public localScreenShareStream: Signal<MediaStream> = computed<MediaStream>(() => {
        this.internalLocalScreenShareTrigger();
        return this.internalLocalScreenShareStream();
    });

    public isVideoEnabled: Signal<boolean> = computed<boolean>(() => {
        this.internalLocalVideoTrigger();
        return this.internalLocalVideoStream().getVideoTracks().some((track: MediaStreamTrack) => track.enabled);
    });
    public isAudioEnabled: Signal<boolean> = computed<boolean>(() => {
        this.internalLocalAudioTrigger();
        return this.internalLocalAudioStream().getAudioTracks().some((track: MediaStreamTrack) => track.enabled);
    });
    public isScreenSharing: Signal<boolean> = computed<boolean>(() => {
        this.internalLocalScreenShareTrigger();
        return this.internalLocalScreenShareStream().getTracks().length > 0;
    });

    public isHandUp: WritableSignal<boolean> = signal<boolean>(false);

    private internalDevices: WritableSignal<MediaDeviceInfo[]> = signal<MediaDeviceInfo[]>([]);
    public devices: Signal<MediaDeviceInfo[]> = computed<MediaDeviceInfo[]>(() => this.internalDevices());

    private internalSelectedVideoDeviceId: WritableSignal<string> = signal<string>("");
    public selectedVideoDeviceId: Signal<string> = computed<string>(() => this.internalSelectedVideoDeviceId())

    private internalSelectedAudioDeviceId: WritableSignal<string> = signal<string>("");
    public selectedAudioDeviceId: Signal<string> = computed<string>(() => this.internalSelectedAudioDeviceId())


    private internalRemotePeers: WritableSignal<Record<string, RemotePeerType>> = signal<Record<string, RemotePeerType>>({});
    public remotePeers: Signal<Record<string, RemotePeerType>> = computed<Record<string, RemotePeerType>>(() => this.internalRemotePeers());

    private peerConnectionMakingOffer: Record<string, boolean> = {};
    private screenPeerConnectionMakingOffer: Record<string, boolean> = {};
    private peerConnectionIsPolite: Record<string, boolean> = {};

    private conferenceCode: string = "";

    private internalMeeting: WritableSignal<MeetingType | null> = signal<MeetingType | null>(null);
    public meeting: Signal<MeetingType | null> = computed<MeetingType | null>(() => this.internalMeeting());

    public isConferenceExists: Signal<boolean> = computed<boolean>(() => this.internalMeeting() !== null);

    public isMeetingOwner: Signal<boolean> = computed<boolean>(() => {
        const meeting: MeetingType | null = this.internalMeeting();

        if (!meeting) {
            return false;
        }

        return meeting.ownerId === this.authService.user()?.id;
    });

    public hasOwnerJoined: WritableSignal<boolean> = signal<boolean>(true);

    public isRequestedUnmuteByOwner: WritableSignal<boolean> = signal<boolean>(false);
    public isRequestedEnableVideoByOwner: WritableSignal<boolean> = signal<boolean>(false);

    private internalRequestToJoin: WritableSignal<{ name: string, socketId: string }[]> = signal<{ name: string, socketId: string }[]>([]);
    public requestsToJoin: Signal<{ name: string, socketId: string }[]> = computed<{ name: string, socketId: string }[]>(() => this.internalRequestToJoin());

    private internalChatMessages: WritableSignal<MessageType[]> = signal<MessageType[]>([]);
    public chatMessages: Signal<MessageType[]> = computed<MessageType[]>(() => this.internalChatMessages());

    private meetingsService: MeetingsService = inject(MeetingsService);
    private authService: AuthService = inject(AuthService);
    private router: Router = inject(Router);
    private notificationService: NotificationService = inject(NotificationService);

    public async setMeetingByCode(meetingCode: string): Promise<void> {
        await this.meetingsService.getMeetingByCode(meetingCode)
            .then((meeting: MeetingType) => {
                this.internalMeeting.set(meeting);
            }).catch(() => {
                this.internalMeeting.set(null);
            });
    }

    public refreshMeetingInfo(
        title: string,
        isWaitingRoom: boolean,
        isScreenSharing: boolean,
        isGuestAllowed: boolean
    ): void {
        this.internalMeeting.update((meeting: MeetingType | null) => {
            if (meeting) {
                return {
                    ...meeting,
                    title: title,
                    isWaitingRoom: isWaitingRoom,
                    isScreenSharing: isScreenSharing,
                    isGuestAllowed: isGuestAllowed
                };
            }

            return meeting;
        });

        this.socket?.emit("meeting-info-updated", {
            title: title,
            isWaitingRoom: isWaitingRoom,
            isScreenSharing: isScreenSharing,
            isGuestAllowed: isGuestAllowed
        });
    }

    public connect(roomCode: string, isReconnected?: boolean): void {
        if (!this.socket || !this.socket.connected) {
            this.socket = io(environment.serverURL + "/meeting", { withCredentials: true });
        }

        this.conferenceCode = roomCode;

        this.socket.emit("join", { roomCode: roomCode, name: this.localName() });

        this.isConnected.set(true);
        this.isJoining.set(false);

        if (!isReconnected) {
            this.meetingsService.addMeetingToRecent(roomCode);

            this.socket.removeAllListeners();

            if (this.internalMeeting()?.ownerId === this.authService.user()?.id) {
                this.socket.emit("owner-joined");

                this.setupOwnerSocketListeners();
            }

            this.setupSocketListeners();
        }
    }

    private setupOwnerSocketListeners(): void {
        this.socket.on("join-request", (data: { socketId: string, name: string }) => {
            this.internalRequestToJoin.update((requests: { name: string, socketId: string }[]) => {
                if (requests.find((request: { name: string, socketId: string }) => request.socketId === data.socketId)) {
                    return requests;
                }

                return [...requests, { name: data.name, socketId: data.socketId }];
            });
        });

        this.socket.on("request-cancelled", (socketId: string) => {
            this.internalRequestToJoin.update((requests: { name: string, socketId: string }[]) => {
                return requests.filter((request: { name: string, socketId: string }) => request.socketId !== socketId);
            });
        });
    }

    private setupSocketListeners(): void {
        this.socket.on("meeting-info-updated", (data: { title: string, isWaitingRoom: boolean, isScreenSharing: boolean, isGuestAllowed: boolean }) => {
            this.internalMeeting.update((meeting: MeetingType | null) => {
                if (meeting) {
                    return {
                        ...meeting,
                        title: data.title,
                        isWaitingRoom: data.isWaitingRoom,
                        isScreenSharing: data.isScreenSharing,
                        isGuestAllowed: data.isGuestAllowed
                    };
                }

                return meeting;
            });
        });

        this.socket.on("all-users", (users: { socketId: string, name: string, userId: string, isHandUp: boolean }[]) => {
            this.internalRemotePeers.update((currentStreams: Record<string, RemotePeerType>) => {
                const updatedStreams: Record<string, RemotePeerType> = { ...currentStreams };

                users.forEach((user: { socketId: string, name: string, userId: string, isHandUp: boolean }) => {
                    updatedStreams[user.socketId] = {
                        ...currentStreams[user.socketId],
                        name: user.name,
                        userId: user.userId || "",
                        videoStream: currentStreams[user.socketId]?.videoStream || new MediaStream(),
                        audioStream: currentStreams[user.socketId]?.audioStream || new MediaStream(),
                        screenShareStream: currentStreams[user.socketId]?.screenShareStream || new MediaStream(),
                        isHandUp: user.isHandUp
                    };
                });

                return updatedStreams;
            });
        });

        this.socket.on("new-user", async (data: { socketId: string, name: string, userId: string }) => {
            this.peerConnections[data.socketId] = this.createPeerConnection(data.socketId, false);

            this.internalRemotePeers.update((streams: Record<string, RemotePeerType>) => ({
                ...streams,
                [data.socketId]: {
                    ...streams[data.socketId],
                    name: data.name,
                    userId: data.userId || "",
                    videoStream: streams[data.socketId]?.videoStream || new MediaStream(),
                    audioStream: streams[data.socketId]?.audioStream || new MediaStream(),
                    screenShareStream: streams[data.socketId]?.screenShareStream || new MediaStream()
                }
            }));

            if (this.isScreenSharing()) {
                this.screenSenderPeerConnections[data.socketId] = this.createPeerConnection(data.socketId, true, "sender");
            }
        });

        this.socket.on("offer", async (data: { socketId: string, offer: RTCSessionDescriptionInit, isScreenShare: boolean }) => {
            const peerConnections: Record<string, RTCPeerConnection> = data.isScreenShare ? this.screenReceiverPeerConnections : this.peerConnections;

            if (!peerConnections[data.socketId]) {
                peerConnections[data.socketId] = this.createPeerConnection(data.socketId, data.isScreenShare, "receiver");
            }

            const makingOfferRecord: Record<string, boolean> = data.isScreenShare ? this.screenPeerConnectionMakingOffer : this.peerConnectionMakingOffer;

            const offerCollision: boolean = makingOfferRecord[data.socketId] || peerConnections[data.socketId].signalingState !== "stable";

            if (offerCollision && !this.peerConnectionIsPolite[data.socketId]) {
                return;
            }

            try {
                if (offerCollision && this.peerConnectionIsPolite[data.socketId]) {
                    await Promise.all([
                        peerConnections[data.socketId].setLocalDescription({ type: "rollback" }),
                        peerConnections[data.socketId].setRemoteDescription(data.offer)
                    ]);
                }
                else {
                    await peerConnections[data.socketId].setRemoteDescription(data.offer);
                }

                const answer: RTCSessionDescriptionInit = await peerConnections[data.socketId].createAnswer();
                await peerConnections[data.socketId].setLocalDescription(answer);
                this.socket.emit("answer", { socketId: data.socketId, answer: answer, isScreenShare: data.isScreenShare });
            }
            catch (error) {
                console.error("Error during offer handling", error);
            }
        });

        this.socket.on("answer", async (data: { socketId: string, answer: RTCSessionDescriptionInit, isScreenShare: boolean }) => {
            const peerConnections: Record<string, RTCPeerConnection> = data.isScreenShare ? this.screenSenderPeerConnections : this.peerConnections;

            try {
                if (peerConnections[data.socketId] && data.answer && peerConnections[data.socketId].signalingState === "have-local-offer") {
                    await peerConnections[data.socketId].setRemoteDescription(data.answer);
                }
            }
            catch (error) {
                console.error("Error during answer handling", error);
            }
        });

        this.socket.on("iceCandidate", async (data: { socketId: string, candidate: RTCIceCandidate, isScreenShare: boolean, role?: string }) => {
            let peerConnections!: Record<string, RTCPeerConnection>;

            if (data.isScreenShare) {
                if (data.role === "sender") {
                    peerConnections = this.screenReceiverPeerConnections;
                }
                else if (data.role === "receiver") {
                    peerConnections = this.screenSenderPeerConnections;
                }
            }
            else {
                peerConnections = this.peerConnections;
            }

            if (!peerConnections[data.socketId] || !data.candidate) {
                return;
            }

            try {
                await peerConnections[data.socketId].addIceCandidate(data.candidate);
            }
            catch (error) {
                console.error("Error adding received ice candidate", error);
            }
        });

        this.socket.on("mute", (socketId: string) => {
            this.internalRemotePeers.update((streams: Record<string, RemotePeerType>) => ({
                ...streams,
                [socketId]: {
                    ...streams[socketId],
                    isAudioEnabled: false,
                }
            }));
        });

        this.socket.on("unmute", (socketId: string) => {
            this.internalRemotePeers.update((streams: Record<string, RemotePeerType>) => ({
                ...streams,
                [socketId]: {
                    ...streams[socketId],
                    isAudioEnabled: true,
                }
            }));
        });

        this.socket.on("disable-video", (socketId: string) => {
            this.internalRemotePeers.update((streams: Record<string, RemotePeerType>) => ({
                ...streams,
                [socketId]: {
                    ...streams[socketId],
                    isVideoEnabled: false,
                }
            }));
        });

        this.socket.on("enable-video", (socketId: string) => {
            this.internalRemotePeers.update((streams: Record<string, RemotePeerType>) => ({
                ...streams,
                [socketId]: {
                    ...streams[socketId],
                    isVideoEnabled: true,
                }
            }));
        });

        this.socket.on("start-screen-share", (socketId: string) => {
            this.internalRemotePeers.update((streams: Record<string, RemotePeerType>) => ({
                ...streams,
                [socketId]: {
                    ...streams[socketId],
                    isScreenSharing: true
                }
            }));
        });

        this.socket.on("stop-screen-share", (socketId: string) => {
            this.internalRemotePeers.update((streams: Record<string, RemotePeerType>) => ({
                ...streams,
                [socketId]: {
                    ...streams[socketId],
                    isScreenSharing: false
                }
            }));

            if (this.screenReceiverPeerConnections[socketId]) {
                this.screenReceiverPeerConnections[socketId].close();
                delete this.screenReceiverPeerConnections[socketId];

                delete this.screenPeerConnectionMakingOffer[socketId];

                this.internalRemotePeers.update((streams: Record<string, RemotePeerType>) => {
                    if (streams[socketId]) {
                        streams[socketId].screenShareStream = new MediaStream();
                    }

                    return { ...streams };
                });
            }
        });

        this.socket.on("hand-up", (socketId: string) => {
            this.internalRemotePeers.update((streams: Record<string, RemotePeerType>) => ({
                ...streams,
                [socketId]: {
                    ...streams[socketId],
                    isHandUp: true
                }
            }));
        });

        this.socket.on("hand-down", (socketId: string) => {
            this.internalRemotePeers.update((streams: Record<string, RemotePeerType>) => ({
                ...streams,
                [socketId]: {
                    ...streams[socketId],
                    isHandUp: false
                }
            }));
        });

        this.socket.on("muted-by-owner", () => {
            if (this.isAudioEnabled()) {
                this.toggleAudio();
                this.notificationService.showNotification("Muted", "You have been muted by the meeting owner.", "info", 5000);
            }
        });

        this.socket.on("requested-unmute-by-owner", () => {
            this.isRequestedUnmuteByOwner.set(true);
        });

        this.socket.on("video-disabled-by-owner", () => {
            if (this.isVideoEnabled()) {
                this.toggleVideo();
                this.notificationService.showNotification("Video Disabled", "Your video has been disabled by the meeting owner.", "info", 5000);
            }
        });

        this.socket.on("requested-enable-video-by-owner", () => {
            this.isRequestedEnableVideoByOwner.set(true);
        });

        this.socket.on("removed-from-meeting", () => {
            this.leave();
            this.router.navigate(["/"]);
            this.notificationService.showNotification("Removed from Meeting", "You have been removed from the meeting by the owner.", "info", 10000);
        });

        this.socket.on("ownership-transferred", (participantId: string) => {
            this.internalMeeting.update((meeting: MeetingType | null) => {
                if (meeting) {
                    return { ...meeting, ownerId: participantId };
                }

                return meeting;
            });

            this.notificationService.showNotification("Ownership Transferred", "Meeting ownership has been transferred to another participant.", "info", 5000);
        });

        this.socket.on("chat-message", (message: MessageType) => {
            this.internalChatMessages.update((messages: MessageType[]) => [...messages, message]);
        });

        this.socket.on("user-leave", (data: { socketId: string, name: string }) => {
            this.closePeer(data.socketId);
            this.notificationService.showNotification("User Left", `${data.name || "A user"} has left the meeting.`, "info", 5000);
        });

        document.addEventListener("visibilitychange", this.onVisibilityChange);

        this.socket.on("disconnect", () => {
            if (this.socket.active) {
                if (!this.isReconnecting()) {
                    this.notificationService.showNotification("Connection Error", "Unable to connect to the server. Retrying...", "error", 10000);
                }

                this.isReconnecting.set(true);

                for (const socketId in this.peerConnections) {
                    this.closePeer(socketId);
                }
            }
            else {
                this.leave();
                this.router.navigate(["/"]);
            }
        });

        this.socket.on("connect", () => {
            if (this.isReconnecting()) {
                this.notificationService.hideNotification();
                this.connect(this.conferenceCode, true);

                this.isReconnecting.set(false);
            }
        });
    }

    private onVisibilityChange = (): void => {
        if (document.visibilityState === "visible") {
            let isWebRtcDead: boolean = false;
            if (this.peerConnections && Object.keys(this.peerConnections).length) {
                isWebRtcDead = Object.values(this.peerConnections)
                    .every((peerConnection: RTCPeerConnection) => peerConnection.connectionState === "failed");
            }

            this.socket.io.reconnection(true);

            if (this.socket) {
                if (!this.socket.connected) {
                    this.socket.connect();
                }
                else if (isWebRtcDead) {
                    this.socket.io.engine.close();
                }

                if (this.internalLocalVideoStream().getVideoTracks().every((track: MediaStreamTrack) => track.readyState === "ended")) {
                    this.socket.io.engine.close();
                    this.getUserMedia();
                }
            }
        }
        else if (document.visibilityState === "hidden") {
            const isMobile: boolean = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            if (isMobile && this.socket && this.socket.connected) {
                this.socket.io.reconnection(false);

                this.socket.io.engine.close();
            }
        }
    }

    public requestToJoin(roomCode: string): void {
        if (!this.socket || !this.socket.connected) {
            this.socket = io(environment.serverURL + "/meeting", { withCredentials: true });
        }

        this.hasOwnerJoined.set(true);

        this.socket.emit("request-to-join", { roomCode, name: this.localName() });

        this.isJoining.set(true);

        this.socket.removeAllListeners();

        this.setupLobbySocketListeners(roomCode);
    }

    private setupLobbySocketListeners(roomCode: string): void {
        this.socket.on("owner-not-found", () => {
            this.hasOwnerJoined.set(false);
        });

        this.socket.on("owner-joined", () => {
            this.hasOwnerJoined.set(true);
        });

        this.socket.on("owner-left", () => {
            this.hasOwnerJoined.set(false);
        });

        this.socket.on("request-approved", () => {
            this.connect(roomCode);
        });

        this.socket.on("request-denied", () => {
            this.leave();
            this.isJoining.set(false);

            this.router.navigate(["/"]);
            this.notificationService.showNotification("Request Denied", "Your request to join the meeting was denied by the owner.", "info", 10000);
        });
    }

    public async getUserMedia(): Promise<void> {
        try {
            const stream: MediaStream = await navigator.mediaDevices.getUserMedia(
                {
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true
                    },
                    video: {
                        width: { ideal: 1920, max: 1920 },
                        height: { ideal: 1080, max: 1080 },
                        frameRate: { ideal: 30, max: 60 },
                        facingMode: "user"
                    }
                }
            );

            this.internalLocalVideoStream.set(new MediaStream(stream.getVideoTracks()));
            this.internalLocalVideoTrigger.update((value: number) => value + 1);

            this.internalLocalAudioStream.set(new MediaStream(stream.getAudioTracks()));
            this.internalLocalAudioTrigger.update((value: number) => value + 1);

            await this.enumerateDevices();

            navigator.mediaDevices.ondevicechange = async () => {
                await this.enumerateDevices();
            };
        }
        catch (error: unknown) {
            console.error("getUserMedia error", error);

            if (error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "SecurityError")) {
                this.notificationService.showNotification("Permission Denied", "Permission to access camera and microphone was denied. Please allow access and try again.", "error", 10000);
                this.router.navigate(["/"]);
                return;
            }
            else if (error instanceof DOMException && error.name === "NotFoundError") {
                this.notificationService.showNotification("No Media Devices", "No camera or microphone devices were found. Please connect a device and try again.", "error", 10000);
                this.router.navigate(["/"]);
                return;
            }
            else if (error instanceof DOMException && error.name === "OverconstrainedError") {
                this.notificationService.showNotification("Device Constraints Not Satisfied", "The selected camera or microphone does not meet the required constraints. Please select a different device and try again.", "error", 10000);
                this.router.navigate(["/"]);
                return;
            }
            else if (error instanceof DOMException && error.name === "NotReadableError") {
                this.notificationService.showNotification("Device Unavailable", "The camera or microphone is currently in use by another application. Please close other applications and try again.", "error", 10000);
                this.router.navigate(["/"]);
                return;
            }

            this.notificationService.showNotification("Media Error", "An error occurred while accessing media devices. Please reload the page and try again.", "error", 10000);
        }
    }

    private async enumerateDevices(): Promise<void> {
        const devices: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices();

        const uniqueDevices: Map<string, MediaDeviceInfo> = new Map<string, MediaDeviceInfo>();
        devices.forEach((device: MediaDeviceInfo) => {
            const key: string = device.kind + " " + device.groupId;

            if (!uniqueDevices.has(key)) {
                uniqueDevices.set(key, device);
            }
        });

        this.internalDevices.set(Array.from(uniqueDevices.values()));

        if (!this.internalSelectedVideoDeviceId()) {
            this.internalSelectedVideoDeviceId.set(this.internalLocalVideoStream().getVideoTracks()[0]?.getSettings().deviceId || "");
        }

        if (!this.internalSelectedAudioDeviceId()) {
            this.internalSelectedAudioDeviceId.set(this.internalLocalAudioStream().getAudioTracks()[0]?.getSettings().deviceId || "");
        }
    }

    public toggleVideo(): void {
        this.internalLocalVideoStream().getVideoTracks().forEach((track: MediaStreamTrack) => {
            track.enabled = !track.enabled;
        });

        this.internalLocalVideoTrigger.update((value: number) => value + 1);

        this.socket?.emit((this.isVideoEnabled() ? "enable-video" : "disable-video"));
    }

    public toggleAudio(): void {
        this.internalLocalAudioStream().getAudioTracks().forEach((track: MediaStreamTrack) => {
            track.enabled = !track.enabled;
        });

        this.internalLocalAudioTrigger.update((value: number) => value + 1);

        this.socket?.emit((this.isAudioEnabled() ? "unmute" : "mute"));
    }

    public async changeVideoDevice(deviceId: string): Promise<void> {
        try {
            const newStream: MediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: {
                        exact: deviceId
                    }
                }
            });

            this.internalLocalVideoStream.set(new MediaStream(newStream.getVideoTracks()));
            this.internalLocalVideoTrigger.update((value: number) => value + 1);
            this.internalSelectedVideoDeviceId.set(deviceId);

            for (const peerConnection of Object.values(this.peerConnections)) {
                const senders: RTCRtpSender[] = peerConnection.getSenders().filter((sender: RTCRtpSender) => sender.track?.kind === "video");

                senders.forEach((sender: RTCRtpSender, index: number) => {
                    sender.replaceTrack(newStream.getVideoTracks()[index]);
                });
            }
        }
        catch (error: unknown) {
            console.error("changeVideoDevice error", error);

            if (error instanceof DOMException && error.name === "OverconstrainedError") {
                this.notificationService.showNotification("Device Constraints Not Satisfied", "The selected camera does not meet the required constraints. Please select a different device and try again.", "error", 10000);
                return;
            }
            else if (error instanceof DOMException && error.name === "NotReadableError") {
                this.notificationService.showNotification("Device Unavailable", "The camera is currently in use by another application. Please close other applications and try again.", "error", 10000);
                return;
            }
            else if (error instanceof DOMException && error.name === "NotFoundError") {
                this.notificationService.showNotification("Device Not Found", "The selected camera was not found. Please select a different device and try again.", "error", 10000);
                return;
            }
            else if (error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "SecurityError")) {
                this.notificationService.showNotification("Permission Denied", "Permission to access the camera was denied. Please allow access and try again.", "error", 10000);
                return;
            }

            this.notificationService.showNotification("Camera Error", "An error occurred while changing the camera. Please try again.", "error", 10000);
        }
    }

    public async changeAudioDevice(deviceId: string): Promise<void> {
        try {
            const newStream: MediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    deviceId: {
                        exact: deviceId
                    }
                }
            });

            this.internalLocalAudioStream.set(new MediaStream(newStream.getAudioTracks()));
            this.internalLocalAudioTrigger.update((value: number) => value + 1);
            this.internalSelectedAudioDeviceId.set(deviceId);

            for (const peerConnection of Object.values(this.peerConnections)) {
                const senders: RTCRtpSender[] = peerConnection.getSenders().filter((sender: RTCRtpSender) => sender.track?.kind === "audio");

                senders.forEach((sender: RTCRtpSender, index: number) => {
                    sender.replaceTrack(newStream.getAudioTracks()[index]);
                });
            }
        }
        catch (error: unknown) {
            console.error("changeAudioDevice error", error);

            if (error instanceof DOMException && error.name === "OverconstrainedError") {
                this.notificationService.showNotification("Device Constraints Not Satisfied", "The selected microphone does not meet the required constraints. Please select a different device and try again.", "error", 10000);
                return;
            }
            else if (error instanceof DOMException && error.name === "NotReadableError") {
                this.notificationService.showNotification("Device Unavailable", "The microphone is currently in use by another application. Please close other applications and try again.", "error", 10000);
                return;
            }
            else if (error instanceof DOMException && error.name === "NotFoundError") {
                this.notificationService.showNotification("Device Not Found", "The selected microphone was not found. Please select a different device and try again.", "error", 10000);
                return;
            }
            else if (error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "SecurityError")) {
                this.notificationService.showNotification("Permission Denied", "Permission to access the microphone was denied. Please allow access and try again.", "error", 10000);
                return;
            }

            this.notificationService.showNotification("Microphone Error", "An error occurred while changing the microphone. Please try again.", "error", 10000);
        }
    }

    public async toggleScreenShare(): Promise<void> {
        if (this.isScreenSharing()) {
            await this.stopScreenShare();
        }
        else {
            await this.startScreenShare();
        }
    }

    public toggleHand(): void {
        this.isHandUp.update((value: boolean) => !value);

        this.socket?.emit(this.isHandUp() ? "hand-up" : "hand-down");
    }

    public muteUser(socketId: string): void {
        this.socket?.emit("mute-user", socketId);
    }

    public unmuteUser(socketId: string): void {
        this.socket?.emit("unmute-user", socketId);
    }

    public disableVideoUser(socketId: string): void {
        this.socket?.emit("disable-video-user", socketId);
    }

    public enableVideoUser(socketId: string): void {
        this.socket?.emit("enable-video-user", socketId);
    }

    public kickUser(socketId: string): void {
        this.socket?.emit("remove-user", socketId);
    }

    public transferOwnership(participantId: string): void {
        this.socket?.emit("transfer-ownership", participantId);
    }

    public approveRequestToJoin(socketId: string): void {
        this.socket?.emit("approve-request", socketId);

        this.internalRequestToJoin.update((requests: { name: string, socketId: string }[]) => {
            return requests.filter((request: { name: string, socketId: string }) => request.socketId !== socketId);
        });
    }

    public declineRequestToJoin(socketId: string): void {
        this.socket?.emit("deny-request", socketId);

        this.internalRequestToJoin.update((requests: { name: string, socketId: string }[]) => {
            return requests.filter((request: { name: string, socketId: string }) => request.socketId !== socketId);
        });
    }

    public sendMessage(content: string): void {
        const message: MessageType = {
            id: crypto.randomUUID(),
            content: content,
            senderName: this.localName()
        };

        this.internalChatMessages.update((messages: MessageType[]) => [...messages, message]);

        this.socket?.emit("chat-message", message);
    }

    private async startScreenShare(): Promise<void> {
        try {
            const screenStream: MediaStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    width: { ideal: 1920, max: 1920 },
                    height: { ideal: 1080, max: 1080 },
                    frameRate: { ideal: 30, max: 60 }
                },
                audio: false
            });

            screenStream.getTracks().forEach((track: MediaStreamTrack) => {
                track.onended = async () => {
                    await this.stopScreenShare();
                };
            });

            this.internalLocalScreenShareStream.set(screenStream);

            this.internalLocalScreenShareTrigger.update((value: number) => value + 1);

            for (const socketId of Object.keys(this.peerConnections)) {
                if (this.screenSenderPeerConnections[socketId]) {
                    this.screenSenderPeerConnections[socketId].close();
                    delete this.screenSenderPeerConnections[socketId];

                    delete this.screenPeerConnectionMakingOffer[socketId];
                }

                this.screenSenderPeerConnections[socketId] = this.createPeerConnection(socketId, true, "sender");
            }

            this.socket?.emit("start-screen-share");
        }
        catch (error: unknown) {
            console.error("toggleScreenShare error", error);

            if (error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "SecurityError")) {
                this.notificationService.showNotification("Permission Denied", "Permission to access screen sharing was denied. Please allow access and try again.", "error", 10000);
                return;
            }
            else if (error instanceof DOMException && error.name === "NotFoundError") {
                this.notificationService.showNotification("No Screen Share Source", "No screen or window was found to share. Please try again.", "error", 10000);
                return;
            }
            else if (error instanceof DOMException && error.name === "NotReadableError") {
                this.notificationService.showNotification("Screen Share Unavailable", "Screen sharing is currently unavailable. Please close other applications that may be using screen sharing and try again.", "error", 10000);
                return;
            }
            else if (error instanceof DOMException && error.name === "OverconstrainedError") {
                this.notificationService.showNotification("Screen Share Constraints Not Satisfied", "The selected screen or window does not meet the required constraints. Please select a different source and try again.", "error", 10000);
                return;
            }

            this.notificationService.showNotification("Screen Share Error", "An error occurred while starting screen sharing. Please try again.", "error", 10000);
        }
    }

    private async stopScreenShare(): Promise<void> {
        const tracks: MediaStreamTrack[] = this.internalLocalScreenShareStream().getTracks();

        tracks.forEach((track: MediaStreamTrack) => track.stop());

        for (const socketId of Object.keys(this.screenSenderPeerConnections)) {
            this.screenSenderPeerConnections[socketId].close();
            delete this.screenSenderPeerConnections[socketId];

            delete this.screenPeerConnectionMakingOffer[socketId];
        }

        this.internalLocalScreenShareStream.set(new MediaStream());

        this.internalLocalScreenShareTrigger.update((value: number) => value + 1);

        this.socket?.emit("stop-screen-share");
    }

    public closeConnection(): void {
        this.localAudioStream().getTracks().forEach((track: MediaStreamTrack) => track.stop());
        this.localVideoStream().getTracks().forEach((track: MediaStreamTrack) => track.stop());
        this.localScreenShareStream().getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }

    public leave(): void {
        for (const socketId in this.peerConnections) {
            this.closePeer(socketId);
        }

        this.stopScreenShare();

        this.closeConnection();

        this.internalRemotePeers.set({});

        this.socket?.emit("leave", this.conferenceCode);
        this.socket?.disconnect();

        document.removeEventListener("visibilitychange", this.onVisibilityChange);

        setTimeout(() => {
            this.isConnected.set(false);
            this.isJoining.set(false);
        }, 0);
    }

    private createPeerConnection(socketId: string, isScreenShare: boolean, role?: "sender" | "receiver"): RTCPeerConnection {
        const peerConnection: RTCPeerConnection = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        this.peerConnectionIsPolite[socketId] = this.socket.id! < socketId;

        if (!isScreenShare) {
            this.internalLocalAudioStream().getAudioTracks().forEach((track: MediaStreamTrack) => {
                peerConnection.addTrack(track);
            });

            this.internalLocalVideoStream().getVideoTracks().forEach((track: MediaStreamTrack) => {
                peerConnection.addTrack(track);
            });
        }
        else {
            this.internalLocalScreenShareStream().getTracks().forEach((track: MediaStreamTrack) => {
                peerConnection.addTrack(track);
            });
        }

        peerConnection.ontrack = (event: RTCTrackEvent) => {
            const currentRemoteStreams: Record<string, RemotePeerType> = this.internalRemotePeers();

            if (!currentRemoteStreams[socketId]) {
                return;
            }

            const updatedEntry: RemotePeerType = {
                ...currentRemoteStreams[socketId],
                videoStream: currentRemoteStreams[socketId]?.videoStream || new MediaStream(),
                audioStream: currentRemoteStreams[socketId]?.audioStream || new MediaStream(),
                screenShareStream: currentRemoteStreams[socketId]?.screenShareStream || new MediaStream(),
            };

            if (isScreenShare) {
                updatedEntry.screenShareStream.addTrack(event.track);
            }
            else {
                if (event.track.kind === "audio") {
                    updatedEntry.audioStream.addTrack(event.track);
                }

                if (event.track.kind === "video") {
                    updatedEntry.videoStream.addTrack(event.track);
                }
            }

            updatedEntry.isAudioEnabled = updatedEntry.audioStream.getAudioTracks().some((track: MediaStreamTrack) => track.enabled);
            updatedEntry.isVideoEnabled = updatedEntry.videoStream.getVideoTracks().some((track: MediaStreamTrack) => track.enabled);
            updatedEntry.isScreenSharing = updatedEntry.screenShareStream.getTracks().length > 0;

            this.internalRemotePeers.update((streams: Record<string, RemotePeerType>) => ({ ...streams, [socketId]: updatedEntry }));
        }

        peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if (event.candidate) {
                this.socket.emit("iceCandidate", { socketId: socketId, candidate: event.candidate, isScreenShare: isScreenShare, role: role });
            }
        };

        peerConnection.oniceconnectionstatechange = async () => {
            if (peerConnection.iceConnectionState === "disconnected" || peerConnection.iceConnectionState === "failed") {
                peerConnection.restartIce();
            }
        };

        peerConnection.onconnectionstatechange = () => {
            if (peerConnection.connectionState === "connected") {
                if (!isScreenShare) {
                    peerConnection.getSenders().forEach((sender: RTCRtpSender) => {
                        if (sender.track?.kind === "audio") {
                            sender.track.enabled = this.isAudioEnabled();
                        }

                        if (sender.track?.kind === "video") {
                            sender.track.enabled = this.isVideoEnabled();
                        }
                    });

                    this.socket?.emit((this.isAudioEnabled() ? "unmute" : "mute"));
                    this.socket?.emit((this.isVideoEnabled() ? "enable-video" : "disable-video"));
                }
                else if (role === "sender" && this.isScreenSharing()) {
                    this.socket?.emit("start-screen-share");
                }
            }

            if (peerConnection.connectionState === "failed") {
                if (!navigator.onLine) {
                    this.socket.io.engine.close();
                    return;
                }

                this.closePeer(socketId);
            }
        };

        peerConnection.onnegotiationneeded = async () => {
            try {
                if (isScreenShare) {
                    this.screenPeerConnectionMakingOffer[socketId] = true;
                }
                else {
                    this.peerConnectionMakingOffer[socketId] = true;
                }

                const offer: RTCSessionDescriptionInit = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offer);

                this.socket.emit("offer", { socketId, offer: peerConnection.localDescription, isScreenShare: isScreenShare });
            }
            catch (error) {
                console.error("Negotiation failed", error);
            }
            finally {
                if (isScreenShare) {
                    this.screenPeerConnectionMakingOffer[socketId] = false;
                }
                else {
                    this.peerConnectionMakingOffer[socketId] = false;
                }
            }
        };

        return peerConnection;
    }

    private closePeer(socketId: string): void {
        const streamEntry: RemotePeerType = this.internalRemotePeers()[socketId];

        if (streamEntry) {
            streamEntry.audioStream.getTracks().forEach((track: MediaStreamTrack) => {
                track.stop();
            });

            streamEntry.videoStream.getTracks().forEach((track: MediaStreamTrack) => {
                track.stop();
            });

            streamEntry.screenShareStream.getTracks().forEach((track: MediaStreamTrack) => {
                track.stop();
            });
        }

        this.internalRemotePeers.update((streams: Record<string, RemotePeerType>) => {
            const updated: Record<string, RemotePeerType> = { ...streams };
            delete updated[socketId];
            return updated;
        });

        if (this.peerConnections[socketId]) {
            this.peerConnections[socketId].close();
            delete this.peerConnections[socketId];
        }

        if (this.screenSenderPeerConnections[socketId]) {
            this.screenSenderPeerConnections[socketId].close();
            delete this.screenSenderPeerConnections[socketId];
        }

        if (this.screenReceiverPeerConnections[socketId]) {
            this.screenReceiverPeerConnections[socketId].close();
            delete this.screenReceiverPeerConnections[socketId];
        }

        delete this.peerConnectionMakingOffer[socketId];
        delete this.screenPeerConnectionMakingOffer[socketId];
        delete this.peerConnectionIsPolite[socketId];
    }
}
