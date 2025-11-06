import { Component, computed, effect, ElementRef, inject, Signal, signal, untracked, viewChild, WritableSignal } from "@angular/core";
import { Participant } from "@components/conference/participant/participant";
import { ControlsItem } from "@components/conference/controls-item/controls-item";
import { ParticipantType } from "@shared/types/ParticipantType";
import { ConferenceControlsItemType } from "@shared/types/ConferenceControlsItemType";
import { ConferenceWebsocket } from "@shared/services/conference-websocket";
import { StreamsType } from "@shared/types/StreamsType";

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
            isEnabled: false
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
            const remoteStreams: Record<string, StreamsType> = this.conferenceWebSocket.remoteStreams();

            const participants: ParticipantType[] = untracked(this.participants);

            const updatedParticipants: ParticipantType[] = Object.entries(remoteStreams).map(([socketId, streams]: [string, StreamsType]) => {
                const participant: ParticipantType | undefined = participants.find((participant: ParticipantType) => participant.id === socketId);

                if (participant) {
                    const currentVideoStreamTracks: MediaStreamTrack[] = participant.videoStream.getVideoTracks();

                    const newVideoStreamTracks: MediaStreamTrack[] = remoteStreams[socketId].stream.getVideoTracks();

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
                        isAudioEnabled: remoteStreams[participant.id].isAudioEnabled,
                        isVideoEnabled: remoteStreams[participant.id].isVideoEnabled,
                    };
                }
                else {
                    return {
                        id: socketId,
                        name: `User ${socketId.substring(0, 5)}`,
                        isAudioEnabled: streams.isAudioEnabled,
                        isVideoEnabled: streams.isVideoEnabled,
                        audioStream: streams.stream,
                        videoStream: new MediaStream(streams.stream.getVideoTracks()),
                        isMoved: false,
                        isLocal: false,
                    };
                }
            });

            let localParticipant: ParticipantType | undefined = participants.find((participant: ParticipantType) => participant.isLocal);

            if (localParticipant) {
                const currentVideoStreamTracks: MediaStreamTrack[] = localParticipant.videoStream.getVideoTracks();

                const newVideoStreamTracks: MediaStreamTrack[] = this.conferenceWebSocket.localStream().getVideoTracks();

                for (const track of newVideoStreamTracks) {
                    if (!currentVideoStreamTracks.includes(track)) {
                        localParticipant.videoStream.addTrack(track);
                    }
                }

                for (const track of currentVideoStreamTracks) {
                    if (!newVideoStreamTracks.includes(track)) {
                        localParticipant.videoStream.removeTrack(track);
                    }
                }

                localParticipant = {
                    ...localParticipant,
                    isAudioEnabled: this.conferenceWebSocket.isAudioEnabled(),
                    isVideoEnabled: this.conferenceWebSocket.isVideoEnabled(),
                };
            }
            else {
                const localVideoStreamTracks: MediaStreamTrack[] = this.conferenceWebSocket.localStream().getVideoTracks();

                localParticipant = {
                    id: "local",
                    name: "You",
                    isAudioEnabled: this.conferenceWebSocket.isAudioEnabled(),
                    isVideoEnabled: this.conferenceWebSocket.isVideoEnabled(),
                    audioStream: new MediaStream(),
                    videoStream: new MediaStream(localVideoStreamTracks),
                    isMoved: false,
                    isLocal: true
                };
            }

            updatedParticipants.push(localParticipant);

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
