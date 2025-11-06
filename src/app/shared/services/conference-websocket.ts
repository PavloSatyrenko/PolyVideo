import { computed, Injectable, Signal, signal, WritableSignal } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { environment } from "@shared/environments/environment";
import { StreamsType } from "@shared/types/StreamsType";

@Injectable({
    providedIn: "root"
})
export class ConferenceWebsocket {
    private socket!: Socket;
    private peerConnections: Record<string, RTCPeerConnection> = {};

    private internalLocalStream: WritableSignal<MediaStream> = signal(new MediaStream());
    public localStream: Signal<MediaStream> = computed<MediaStream>(() => this.internalLocalStream());

    private internalMetaData: WritableSignal<{ version: number, isVideoEnabled: boolean, isAudioEnabled: boolean }> = signal({
        version: 0,
        isVideoEnabled: false,
        isAudioEnabled: false
    });
    public isAudioEnabled: Signal<boolean> = computed<boolean>(() => this.internalMetaData().isAudioEnabled);
    public isVideoEnabled: Signal<boolean> = computed<boolean>(() => this.internalMetaData().isVideoEnabled);

    private internalDevices: WritableSignal<MediaDeviceInfo[]> = signal<MediaDeviceInfo[]>([]);
    public devices: Signal<MediaDeviceInfo[]> = computed<MediaDeviceInfo[]>(() => this.internalDevices());

    private internalRemoteStreams: WritableSignal<Record<string, StreamsType>> = signal<Record<string, StreamsType>>({});
    public remoteStreams: Signal<Record<string, StreamsType>> = computed<Record<string, StreamsType>>(() => this.internalRemoteStreams());

    private peerConnectionStatus: Record<string, boolean> = {};

    public connect(roomId: string): void {
        this.socket = io(environment.serverURL + "/meeting");

        this.socket.emit("join", roomId);

        this.socket.on("new-user", async (socketId: string) => {
            this.peerConnections[socketId] = this.createPeerConnection(socketId);

            const offer: RTCSessionDescriptionInit = await this.peerConnections[socketId].createOffer();
            await this.peerConnections[socketId].setLocalDescription(offer);
            this.socket.emit("offer", { socketId: socketId, offer: offer });
        });

        this.socket.on("offer", async (data: { socketId: string, offer: RTCSessionDescriptionInit }) => {
            this.peerConnections[data.socketId] = this.createPeerConnection(data.socketId);

            await this.peerConnections[data.socketId].setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer: RTCSessionDescriptionInit = await this.peerConnections[data.socketId].createAnswer();
            await this.peerConnections[data.socketId].setLocalDescription(answer);

            this.socket.emit("answer", { socketId: data.socketId, answer: answer });
        });

        this.socket.on("answer", async (data: { socketId: string, answer: RTCSessionDescriptionInit }) => {
            await this.peerConnections[data.socketId].setRemoteDescription(new RTCSessionDescription(data.answer));
        });

        this.socket.on("iceCandidate", async (data: { socketId: string, candidate: RTCIceCandidate }) => {
            await this.peerConnections[data.socketId].addIceCandidate(new RTCIceCandidate(data.candidate));
        });

        this.socket.on("mute", (socketId: string) => {
            this.internalRemoteStreams.update((streams: Record<string, StreamsType>) => ({
                ...streams,
                [socketId]: {
                    stream: streams[socketId]?.stream ?? new MediaStream(),
                    isVideoEnabled: streams[socketId]?.isVideoEnabled ?? false,
                    isAudioEnabled: false
                }
            }));
        });

        this.socket.on("unmute", (socketId: string) => {
            this.internalRemoteStreams.update((streams: Record<string, StreamsType>) => ({
                ...streams,
                [socketId]: {
                    stream: streams[socketId]?.stream ?? new MediaStream(),
                    isVideoEnabled: streams[socketId]?.isVideoEnabled ?? false,
                    isAudioEnabled: true,
                }
            }));
        });

        this.socket.on("disable-video", (socketId: string) => {
            this.internalRemoteStreams.update((streams: Record<string, StreamsType>) => ({
                ...streams,
                [socketId]: {
                    stream: streams[socketId]?.stream ?? new MediaStream(),
                    isVideoEnabled: false,
                    isAudioEnabled: streams[socketId]?.isAudioEnabled ?? false,
                }
            }));
        });

        this.socket.on("enable-video", (socketId: string) => {
            this.internalRemoteStreams.update((streams: Record<string, StreamsType>) => ({
                ...streams,
                [socketId]: {
                    stream: streams[socketId]?.stream ?? new MediaStream(),
                    isVideoEnabled: true,
                    isAudioEnabled: streams[socketId]?.isAudioEnabled ?? false,
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

            this.internalLocalStream.set(stream);

            this.internalMetaData.set({
                version: this.internalMetaData().version + 1,
                isVideoEnabled: stream.getVideoTracks().some((track: MediaStreamTrack) => track.enabled),
                isAudioEnabled: stream.getAudioTracks().some((track: MediaStreamTrack) => track.enabled),
            });

            this.internalDevices.set(await navigator.mediaDevices.enumerateDevices());
        }
        catch (error) {
            console.error("getUserMedia error", error);
        }
    }

    public toggleAudio(): void {
        const stream: MediaStream = this.internalLocalStream();

        stream.getAudioTracks().forEach((track: MediaStreamTrack) => {
            track.enabled = !track.enabled;
        });

        this.internalMetaData.update((metaData) => ({
            version: metaData.version + 1,
            isVideoEnabled: metaData.isVideoEnabled,
            isAudioEnabled: stream.getAudioTracks().some((track: MediaStreamTrack) => track.enabled),
        }));

        this.socket?.emit((this.isAudioEnabled() ? "unmute" : "mute"));
    }

    public toggleVideo(): void {
        const stream: MediaStream = this.internalLocalStream();

        stream.getVideoTracks().forEach((track: MediaStreamTrack) => {
            track.enabled = !track.enabled;
        });

        this.internalMetaData.update((metaData) => ({
            version: metaData.version + 1,
            isVideoEnabled: stream.getVideoTracks().some((track: MediaStreamTrack) => track.enabled),
            isAudioEnabled: metaData.isAudioEnabled,
        }));

        this.socket?.emit((this.isVideoEnabled() ? "enable-video" : "disable-video"));
    }

    public toggleScreenShare(): void {

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

        this.internalLocalStream().getAudioTracks().forEach((track: MediaStreamTrack) => {
            track.enabled = this.isAudioEnabled();
            peerConnection.addTrack(track);
        });

        this.internalLocalStream().getVideoTracks().forEach((track: MediaStreamTrack) => {
            track.enabled = this.isVideoEnabled();
            peerConnection.addTrack(track);
        });

        peerConnection.ontrack = (event: RTCTrackEvent) => {
            const currentRemoteStreams: Record<string, StreamsType> = this.internalRemoteStreams();

            const updatedEntry: StreamsType = { ...(currentRemoteStreams[socketId] ?? { stream: new MediaStream() }) }

            updatedEntry.stream.addTrack(event.track);

            updatedEntry.isAudioEnabled = updatedEntry.stream.getAudioTracks().some((track: MediaStreamTrack) => track.enabled);
            updatedEntry.isVideoEnabled = updatedEntry.stream.getVideoTracks().some((track: MediaStreamTrack) => track.enabled);

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
            }
        };

        return peerConnection;
    }

    private closePeer(socketId: string): void {
        const streamEntry: StreamsType = this.internalRemoteStreams()[socketId];

        if (streamEntry) {
            streamEntry.stream.getTracks().forEach((track: MediaStreamTrack) => {
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
    }
}
