import { Component, effect, ElementRef, inject, Signal, signal, untracked, viewChild, WritableSignal } from "@angular/core";
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

    protected controlsItems: WritableSignal<ConferenceControlsItemType[]> = signal<ConferenceControlsItemType[]>(["audio", "video", "screen", "participants", "chat", "hand", "other", "leave"]);

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

            const updatedParticipants: ParticipantType[] = Object.entries(remoteStreams).map(([socketId, streams]: [string, StreamsType]) => ({
                id: socketId,
                name: `User ${socketId.substring(0, 5)}`,
                isAudioEnabled: true,
                isVideoEnabled: true,
                audioStream: streams.audioStream,
                videoStream: streams.videoStream,
                isMoved: false,
                isLocal: false,
            }));

            updatedParticipants.push({
                id: "local",
                name: "You",
                isAudioEnabled: true,
                isVideoEnabled: true,
                audioStream: this.conferenceWebSocket.localAudioStream(),
                videoStream: this.conferenceWebSocket.localVideoStream(),
                isMoved: false,
                isLocal: true
            });

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
