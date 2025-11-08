import { computed, Injectable, Signal, signal, WritableSignal } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { environment } from "@shared/environments/environment";
import { StreamsType } from "@shared/types/StreamsType";

type MetaDataType = {
    version: number;
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;
    isScreenSharing: boolean;
};

@Injectable({
    providedIn: "root"
})
export class ConferenceWebsocket {
    private socket!: Socket;
    private peerConnections: Record<string, RTCPeerConnection> = {};

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

    private internalDevices: WritableSignal<MediaDeviceInfo[]> = signal<MediaDeviceInfo[]>([]);
    public devices: Signal<MediaDeviceInfo[]> = computed<MediaDeviceInfo[]>(() => this.internalDevices());

    private internalRemoteStreams: WritableSignal<Record<string, StreamsType>> = signal<Record<string, StreamsType>>({});
    public remoteStreams: Signal<Record<string, StreamsType>> = computed<Record<string, StreamsType>>(() => this.internalRemoteStreams());

    private peerConnectionStatus: Record<string, boolean> = {};
    private peerConnectionNegotiation: Record<string, boolean> = {};

    public connect(roomId: string): void {
        this.socket = io(environment.serverURL + "/meeting");

        this.socket.emit("join", roomId);

        this.socket.on("new-user", async (socketId: string) => {
            this.peerConnections[socketId] = this.createPeerConnection(socketId);

            this.peerConnectionNegotiation[socketId] = true;

            try {
                const offer: RTCSessionDescriptionInit = await this.peerConnections[socketId].createOffer();
                await this.peerConnections[socketId].setLocalDescription(offer);
                this.socket.emit("offer", { socketId: socketId, offer: offer });
            }
            catch (error) {
                console.error("Error during offer handling", error);
                this.peerConnectionNegotiation[socketId] = false;
            }
        });

        this.socket.on("offer", async (data: { socketId: string, offer: RTCSessionDescriptionInit }) => {
            if (!this.peerConnections[data.socketId]) {
                this.peerConnections[data.socketId] = this.createPeerConnection(data.socketId);
            }

            this.peerConnectionNegotiation[data.socketId] = true;

            try {
                await this.peerConnections[data.socketId].setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer: RTCSessionDescriptionInit = await this.peerConnections[data.socketId].createAnswer();
                await this.peerConnections[data.socketId].setLocalDescription(answer);

                this.peerConnectionNegotiation[data.socketId] = false;

                this.socket.emit("answer", { socketId: data.socketId, answer: answer });
            }
            catch (error) {
                console.error("Error during offer handling", error);
                this.peerConnectionNegotiation[data.socketId] = false;
            }
        });

        this.socket.on("answer", async (data: { socketId: string, answer: RTCSessionDescriptionInit }) => {
            try {
                await this.peerConnections[data.socketId].setRemoteDescription(new RTCSessionDescription(data.answer));
            }
            catch (error) {
                console.error("Error during answer handling", error);
            }
            finally {
                this.peerConnectionNegotiation[data.socketId] = false;
            }
        });

        this.socket.on("iceCandidate", async (data: { socketId: string, candidate: RTCIceCandidate }) => {
            if (!this.peerConnections[data.socketId]) {
                return;
            }

            try {
                await this.peerConnections[data.socketId].addIceCandidate(new RTCIceCandidate(data.candidate));
            }
            catch (error) {
                console.error("Error adding received ice candidate", error);
            }
        });

        this.socket.on("mute", (socketId: string) => {
            this.internalRemoteStreams.update((streams: Record<string, StreamsType>) => ({
                ...streams,
                [socketId]: {
                    ...streams[socketId],
                    isAudioEnabled: false,
                }
            }));
        });

        this.socket.on("unmute", (socketId: string) => {
            this.internalRemoteStreams.update((streams: Record<string, StreamsType>) => ({
                ...streams,
                [socketId]: {
                    ...streams[socketId],
                    isAudioEnabled: true,
                }
            }));
        });

        this.socket.on("disable-video", (socketId: string) => {
            this.internalRemoteStreams.update((streams: Record<string, StreamsType>) => ({
                ...streams,
                [socketId]: {
                    ...streams[socketId],
                    isVideoEnabled: false,
                }
            }));
        });

        this.socket.on("enable-video", (socketId: string) => {
            this.internalRemoteStreams.update((streams: Record<string, StreamsType>) => ({
                ...streams,
                [socketId]: {
                    ...streams[socketId],
                    isVideoEnabled: true,
                }
            }));
        });

        this.socket.on("start-screen-share", (socketId: string) => {
            this.internalRemoteStreams.update((streams: Record<string, StreamsType>) => ({
                ...streams,
                [socketId]: {
                    ...streams[socketId],
                    isScreenSharing: true
                }
            }));
        });

        this.socket.on("stop-screen-share", (socketId: string) => {
            this.internalRemoteStreams.update((streams: Record<string, StreamsType>) => ({
                ...streams,
                [socketId]: {
                    ...streams[socketId],
                    isScreenSharing: false
                }
            }));
        });

        this.socket.on("user-leave", (socketId: string) => {
            this.closePeer(socketId);
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

            this.internalDevices.set(await navigator.mediaDevices.enumerateDevices());
        }
        catch (error) {
            console.error("getUserMedia error", error);
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

    public async toggleScreenShare(): Promise<void> {
        if (this.isScreenSharing()) {
            await this.stopScreenShare();
        }
        else {
            await this.startScreenShare();
        }
    }

    private async startScreenShare(): Promise<void> {
        try {
            const screenStream: MediaStream = await navigator.mediaDevices.getDisplayMedia();

            screenStream.getTracks().forEach((track: MediaStreamTrack) => {
                track.onended = async () => {
                    await this.stopScreenShare();
                };
            });

            this.internalLocalScreenShareStream.set(screenStream);

            this.internalLocalScreenShareTrigger.update((value: number) => value + 1);

            for (const peerConnection of Object.values(this.peerConnections)) {
                screenStream.getTracks().forEach((track: MediaStreamTrack) => {
                    peerConnection.addTrack(track, screenStream);
                });
            }

            this.socket?.emit("start-screen-share");
        }
        catch (error) {
            console.error("toggleScreenShare error", error);
        }
    }

    private async stopScreenShare(): Promise<void> {
        const tracks: MediaStreamTrack[] = this.internalLocalScreenShareStream().getTracks();

        tracks.forEach((track: MediaStreamTrack) => track.stop());

        for (const peerConnection of Object.values(this.peerConnections)) {
            for (const track of tracks) {
                const sender: RTCRtpSender | undefined = peerConnection.getSenders().find((sender: RTCRtpSender) => sender.track === track);

                if (sender) {
                    peerConnection.removeTrack(sender);
                }
            }
        }

        this.internalLocalScreenShareStream.set(new MediaStream());

        this.internalLocalScreenShareTrigger.update((value: number) => value + 1);

        this.socket?.emit("stop-screen-share");
    }

    public leave(roomId: string): void {
        for (const socketId in this.peerConnections) {
            this.closePeer(socketId);
        }

        this.internalRemoteStreams.set({});

        this.socket?.emit("leave", roomId);
        this.socket?.disconnect();
    }

    private createPeerConnection(socketId: string): RTCPeerConnection {
        const peerConnection: RTCPeerConnection = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        this.internalLocalAudioStream().getAudioTracks().forEach((track: MediaStreamTrack) => {
            peerConnection.addTrack(track);
        });

        this.internalLocalVideoStream().getVideoTracks().forEach((track: MediaStreamTrack) => {
            peerConnection.addTrack(track);
        });

        this.internalLocalScreenShareStream().getTracks().forEach((track: MediaStreamTrack) => {
            peerConnection.addTrack(track);
        });

        peerConnection.ontrack = (event: RTCTrackEvent) => {
            console.log(event, event.track.getSettings())
            const currentRemoteStreams: Record<string, StreamsType> = this.internalRemoteStreams();

            const updatedEntry: StreamsType = {
                ...(currentRemoteStreams[socketId] ?? {
                    videoStream: new MediaStream(),
                    audioStream: new MediaStream(),
                    screenShareStream: new MediaStream()
                })
            };

            if (event.track.kind === "audio") {
                updatedEntry.audioStream.addTrack(event.track);
            }

            if (event.track.kind === "video") {
                if (event.streams.length) {
                    updatedEntry.screenShareStream.addTrack(event.track);
                }
                else {
                    updatedEntry.videoStream.addTrack(event.track);
                }
            }

            updatedEntry.isAudioEnabled = updatedEntry.audioStream.getAudioTracks().some((track: MediaStreamTrack) => track.enabled);
            updatedEntry.isVideoEnabled = updatedEntry.videoStream.getVideoTracks().some((track: MediaStreamTrack) => track.enabled);
            updatedEntry.isScreenSharing = updatedEntry.screenShareStream.getTracks().length > 0;

            this.internalRemoteStreams.update((streams: Record<string, StreamsType>) => ({ ...streams, [socketId]: updatedEntry }));
        }

        peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if (event.candidate) {
                this.socket.emit("iceCandidate", { socketId: socketId, candidate: event.candidate });
            }
        };

        peerConnection.onconnectionstatechange = () => {
            if (peerConnection.connectionState === "connected" && !this.peerConnectionStatus[socketId]) {
                this.peerConnectionStatus[socketId] = true;

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
                this.socket?.emit((this.isScreenSharing() ? "start-screen-share" : "stop-screen-share"));
            }
        };

        peerConnection.onnegotiationneeded = async () => {
            try {
                if (this.peerConnectionNegotiation[socketId] || peerConnection.signalingState !== "stable") {
                    return;
                }

                this.peerConnectionNegotiation[socketId] = true;

                const offer: RTCSessionDescriptionInit = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offer);
                this.socket.emit("offer", { socketId, offer });
            }
            catch (error) {
                console.error("Negotiation failed", error);
                this.peerConnectionNegotiation[socketId] = false;
            }
        };

        return peerConnection;
    }

    private closePeer(socketId: string): void {
        const streamEntry: StreamsType = this.internalRemoteStreams()[socketId];

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

        this.internalRemoteStreams.update((streams: Record<string, StreamsType>) => {
            const updated: Record<string, StreamsType> = { ...streams };
            delete updated[socketId];
            return updated;
        });

        if (this.peerConnections[socketId]) {
            this.peerConnections[socketId].close();
            delete this.peerConnections[socketId];
        }

        if (this.peerConnectionStatus[socketId]) {
            delete this.peerConnectionStatus[socketId];
        }

        if (this.peerConnectionNegotiation[socketId]) {
            delete this.peerConnectionNegotiation[socketId];
        }
    }
}
