import { Component, computed, effect, ElementRef, inject, Signal, signal, untracked, viewChild, WritableSignal } from "@angular/core";
import { Participant } from "@components/conference/participant/participant";
import { ControlsItem } from "@components/conference/controls-item/controls-item";
import { ParticipantType } from "@shared/types/ParticipantType";
import { ConferenceControlsItemType } from "@shared/types/ConferenceControlsItemType";
import { ConferenceWebsocket } from "@shared/services/conference-websocket";
import { RemotePeerType } from "@shared/types/RemotePeerType";

@Component({
    selector: "app-conference-room",
    imports: [Participant, ControlsItem],
    templateUrl: "./room.html",
    styleUrl: "./room.css"
})
export class Room {
    protected isSidebarExpanded: WritableSignal<boolean> = signal<boolean>(false);

    protected participants: WritableSignal<ParticipantType[]> = signal([]);

    private participantsWrapper: Signal<ElementRef<HTMLDivElement> | undefined> = viewChild<ElementRef<HTMLDivElement>>("participantsWrapper");

    protected controlsItems: Signal<ConferenceControlsItemType[]> = computed<ConferenceControlsItemType[]>(() => [
        {
            type: "audio",
            isEnabled: this.conferenceWebSocket.isAudioEnabled()
        },
        {
            type: "video",
            isEnabled: this.conferenceWebSocket.isVideoEnabled()
        },
        {
            type: "screen",
            isEnabled: this.conferenceWebSocket.isScreenSharing()
        },
        {
            type: "participants",
        },
        {
            type: "chat",
        },
        {
            type: "hand",
        },
        {
            type: "other",
        },
        {
            type: "leave",
        }
    ]);

    private conferenceWebSocket: ConferenceWebsocket = inject(ConferenceWebsocket);

    constructor() {
        effect(() => {
            if (this.participantsWrapper()) {
                const participantsAmount: number = this.participants().length;

                this.participants().map((participant: ParticipantType) => participant.isMoved = false);

                let { rows, columns } = this.getOptimalParticipantsLayout(this.participantsWrapper()!.nativeElement, participantsAmount);

                this.participantsWrapper()!.nativeElement.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
                this.participantsWrapper()!.nativeElement.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

                if (participantsAmount % 2 && rows > 1) {
                    for (let i = 0; i < participantsAmount - (rows - 1) * columns; i++) {
                        this.participants()[(rows - 1) * columns + i].isMoved = true;
                    }
                }
            }
        });

        effect(() => {
            const remotePeers: Record<string, RemotePeerType> = this.conferenceWebSocket.remotePeers();

            const participants: ParticipantType[] = untracked(this.participants);

            const screenStreams: ParticipantType[] = [];

            const updatedParticipants: ParticipantType[] = Object.entries(remotePeers).map(([socketId, peer]: [string, RemotePeerType]) => {
                const participant: ParticipantType | undefined = participants.find((participant: ParticipantType) => participant.id === socketId);

                if (peer.isScreenSharing) {
                    screenStreams.push({
                        id: `${socketId}-screen`,
                        name: `${peer.name} screen`,
                        isAudioEnabled: false,
                        isVideoEnabled: true,
                        audioStream: new MediaStream(),
                        videoStream: peer.screenShareStream,
                        isMoved: false,
                        isLocal: false,
                        isScreen: true
                    });
                }

                if (participant) {
                    const currentVideoStreamTracks: MediaStreamTrack[] = participant.videoStream.getVideoTracks();

                    const newVideoStreamTracks: MediaStreamTrack[] = remotePeers[socketId].videoStream.getVideoTracks();

                    for (const track of newVideoStreamTracks) {
                        if (!currentVideoStreamTracks.includes(track)) {
                            participant.videoStream.addTrack(track);
                        }
                    }

                    for (const track of currentVideoStreamTracks) {
                        if (!newVideoStreamTracks.includes(track)) {
                            participant.videoStream.removeTrack(track);
                        }
                    }

                    return {
                        ...participant,
                        isAudioEnabled: remotePeers[participant.id].isAudioEnabled,
                        isVideoEnabled: remotePeers[participant.id].isVideoEnabled,
                    };
                }
                else {
                    return {
                        id: socketId,
                        name: peer.name,
                        isAudioEnabled: peer.isAudioEnabled,
                        isVideoEnabled: peer.isVideoEnabled,
                        audioStream: peer.audioStream,
                        videoStream: peer.videoStream,
                        isMoved: false,
                        isLocal: false,
                        isScreen: false
                    };
                }
            });

            updatedParticipants.push(...screenStreams);

            updatedParticipants.push({
                id: "local",
                name: this.conferenceWebSocket.localName(),
                isAudioEnabled: this.conferenceWebSocket.isAudioEnabled(),
                isVideoEnabled: this.conferenceWebSocket.isVideoEnabled(),
                audioStream: new MediaStream(),
                videoStream: this.conferenceWebSocket.localVideoStream(),
                isMoved: false,
                isLocal: true,
                isScreen: false
            });

            if (this.conferenceWebSocket.isScreenSharing()) {
                updatedParticipants.push({
                    id: "local-screen",
                    name: this.conferenceWebSocket.localName() + " screen",
                    isAudioEnabled: false,
                    isVideoEnabled: true,
                    audioStream: new MediaStream(),
                    videoStream: this.conferenceWebSocket.localScreenShareStream(),
                    isMoved: false,
                    isLocal: true,
                    isScreen: true
                });
            }

            this.participants.set(updatedParticipants);
        });
    }

    getOptimalParticipantsLayout(wrapperElement: HTMLElement, participantsAmount: number): { rows: number, columns: number } {
        const optimalLayout: { rows: number, columns: number } = { rows: 1, columns: participantsAmount };
        const aspectRatio: number = wrapperElement.clientWidth / wrapperElement.clientHeight;
        let minWastedSpace: number = Infinity;

        for (let columns = 1; columns <= participantsAmount; columns++) {
            const rows: number = Math.ceil(participantsAmount / columns);

            const cellWidth: number = wrapperElement.clientWidth / columns;
            const cellHeight: number = wrapperElement.clientHeight / rows;

            const cellRatio: number = cellWidth / cellHeight;
            const wastedSpace: number = Math.abs(cellRatio - aspectRatio);

            if (wastedSpace < minWastedSpace) {
                minWastedSpace = wastedSpace;
                optimalLayout.rows = rows;
                optimalLayout.columns = columns;
            }
        }

        return optimalLayout;
    }
}
