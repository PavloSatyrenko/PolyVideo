import { Component, effect, ElementRef, Signal, signal, viewChild, WritableSignal } from "@angular/core";
import { Participant } from "@components/conference/participant/participant";
import { ControlsItem } from "@components/conference/controls-item/controls-item";
import { ParticipantType } from "@shared/types/ParticipantType";
import { ConferenceControlsItemType } from "@shared/types/ConferenceControlsItemType";

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

    constructor() {
        effect(() => {
            if (this.participantsWrapper()) {
                const participantsAmount: number = this.participants().length;

                this.participants().map((participant: ParticipantType) => participant.isMoved = false);

                let { rows, columns } = this.getOptimalParticipantsLayout(this.participantsWrapper()!.nativeElement, participantsAmount);

                this.participantsWrapper()!.nativeElement.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
                this.participantsWrapper()!.nativeElement.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

                if (participantsAmount % 2) {
                    for (let i = 0; i < participantsAmount - (rows - 1) * columns; i++) {
                        this.participants()[(rows - 1) * columns + i].isMoved = true;
                    }
                }
            }
        });
    }

    ngOnInit(): void {
        this.participants.set([
            {
                id: "1",
                name: "You",
                isAudioEnabled: false,
                isVideoEnabled: false,
                audioStream: new MediaStream(),
                videoStream: new MediaStream(),
                isMoved: false,
                isLocal: true
            },
            {
                id: "2",
                name: "Participant 2",
                isAudioEnabled: false,
                isVideoEnabled: false,
                audioStream: new MediaStream(),
                videoStream: new MediaStream(),
                isMoved: false,
                isLocal: false
            },
            {
                id: "3",
                name: "Participant 3",
                isAudioEnabled: false,
                isVideoEnabled: false,
                audioStream: new MediaStream(),
                videoStream: new MediaStream(),
                isMoved: false,
                isLocal: false
            },
            {
                id: "4",
                name: "Participant 4",
                isAudioEnabled: false,
                isVideoEnabled: false,
                audioStream: new MediaStream(),
                videoStream: new MediaStream(),
                isMoved: false,
                isLocal: false
            },
            {
                id: "5",
                name: "Participant 5",
                isAudioEnabled: false,
                isVideoEnabled: false,
                audioStream: new MediaStream(),
                videoStream: new MediaStream(),
                isMoved: false,
                isLocal: false
            }
        ]);
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
