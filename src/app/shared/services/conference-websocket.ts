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

    private internalLocalAudioStream: WritableSignal<MediaStream> = signal(new MediaStream());
    private internalLocalVideoStream: WritableSignal<MediaStream> = signal(new MediaStream());
    public localAudioStream: Signal<MediaStream> = computed<MediaStream>(() => this.internalLocalAudioStream());
    public localVideoStream: Signal<MediaStream> = computed<MediaStream>(() => this.internalLocalVideoStream());

    public isAudioEnabled: Signal<boolean> = computed<boolean>(() => {
        return this.internalLocalAudioStream().getAudioTracks().some((track: MediaStreamTrack) => track.enabled);
    });
    public isVideoEnabled: Signal<boolean> = computed<boolean>(() => {
        return this.internalLocalVideoStream().getVideoTracks().some((track: MediaStreamTrack) => track.enabled);
    });

    private internalRemoteStreams: WritableSignal<Record<string, StreamsType>> = signal<Record<string, StreamsType>>({});
    public remoteStreams: Signal<Record<string, StreamsType>> = computed<Record<string, StreamsType>>(() => this.internalRemoteStreams());

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

        this.socket.on("user-leave", (socketId: string) => {
            this.closePeer(socketId);
        });
    }

    public async getUserMedia(): Promise<void> {
        try {
            this.internalLocalAudioStream.set(await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }));

            const videoConstraints = {
                video: {
                    width: { ideal: 1920, max: 1920 },
                    height: { ideal: 1080, max: 1080 },
                    frameRate: { ideal: 30, max: 60 },
                    facingMode: "user"
                }
            };

            try {
                this.internalLocalVideoStream.set(await navigator.mediaDevices.getUserMedia(videoConstraints));
            }
            catch (highResError) {
                console.warn("High resolution not available, falling back to default:", highResError);
                this.internalLocalVideoStream.set(await navigator.mediaDevices.getUserMedia({ video: true }));
            }
        }
        catch (error) {
            console.error("getUserMedia error", error);
        }
    }

    public toggleAudio(): void {
        this.internalLocalAudioStream.update((localStream: MediaStream) => {
            localStream.getAudioTracks().forEach((track: MediaStreamTrack) => {
                track.enabled = !track.enabled;
            });

            const newStream: MediaStream = new MediaStream();
            localStream.getAudioTracks().forEach((track: MediaStreamTrack) => {
                newStream.addTrack(track);
            });

            return newStream;
        });
    }

    public toggleVideo(): void {
        this.internalLocalVideoStream.update((localStream: MediaStream) => {
            localStream.getVideoTracks().forEach((track: MediaStreamTrack) => {
                track.enabled = !track.enabled;
            });

            const newStream: MediaStream = new MediaStream();
            localStream.getVideoTracks().forEach((track: MediaStreamTrack) => {
                newStream.addTrack(track);
            });

            return newStream;
        });
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

        peerConnection.ontrack = (event: RTCTrackEvent) => {
            const currentRemoteStreams: Record<string, StreamsType> = this.internalRemoteStreams();

            const updatedEntry: StreamsType = { ...(currentRemoteStreams[socketId] ?? { videoStream: new MediaStream(), audioStream: new MediaStream() }) }

            if (event.track.kind == "audio") {
                if (!updatedEntry.audioStream) {
                    updatedEntry.audioStream = new MediaStream();
                }

                updatedEntry.audioStream.addTrack(event.track);
                updatedEntry.isAudioEnabled = event.track.enabled;
            }
            else if (event.track.kind == "video") {
                if (!updatedEntry.videoStream) {
                    updatedEntry.videoStream = new MediaStream();
                }

                updatedEntry.videoStream.addTrack(event.track);
                updatedEntry.isVideoEnabled = event.track.enabled;
            }

            this.internalRemoteStreams.update((streams: Record<string, StreamsType>) => ({ ...streams, [socketId]: updatedEntry }));
        }

        peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if (event.candidate) {
                this.socket.emit("iceCandidate", { socketId: socketId, candidate: event.candidate });
            }
        };

        peerConnection.onconnectionstatechange = () => {
            if (peerConnection.connectionState == "connected") {
                console.log("Peers connected");
            }
        };

        return peerConnection;
    }

    private closePeer(socketId: string): void {
        const streamEntry: StreamsType = this.internalRemoteStreams()[socketId];

        if (streamEntry) {
            streamEntry.audioStream?.getAudioTracks().forEach((track: MediaStreamTrack) => {
                track.stop();
            });

            streamEntry.videoStream?.getVideoTracks().forEach((track: MediaStreamTrack) => {
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
