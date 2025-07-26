import { Component, effect, ElementRef, OnInit, Signal, signal, untracked, viewChild, WritableSignal } from "@angular/core";
import { MeetingControlsItem } from "@features/meeting/meeting-controls-item/meeting-controls-item";
import { MeetingParticipant } from "@features/meeting/meeting-participant/meeting-participant";
import { ParticipantType } from "@shared/types/ParticipantType";

@Component({
    selector: "app-meeting",
    imports: [MeetingControlsItem, MeetingParticipant],
    templateUrl: "./meeting.html",
    styleUrl: "./meeting.css"
})
export class Meeting implements OnInit {
    protected isSidebarExpanded: boolean = false;

    protected participants: WritableSignal<ParticipantType[]> = signal([]);

    private participantsWrapper: Signal<ElementRef<HTMLDivElement> | undefined> = viewChild<ElementRef<HTMLDivElement>>("participantsWrapper");

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
                isAudioEnabled: false,
                isVideoEnabled: false
            },
            {
                id: "2",
                isAudioEnabled: false,
                isVideoEnabled: false
            },
            {
                id: "3",
                isAudioEnabled: false,
                isVideoEnabled: false
            },
            {
                id: "4",
                isAudioEnabled: false,
                isVideoEnabled: false
            },
            {
                id: "5",
                isAudioEnabled: false,
                isVideoEnabled: false
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