import { Component, computed, effect, ElementRef, inject, linkedSignal, OnInit, Signal, signal, untracked, viewChild, WritableSignal } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { MeetingControlsItem } from "@features/meeting/meeting-controls-item/meeting-controls-item";
import { MeetingParticipant } from "@features/meeting/meeting-participant/meeting-participant";
import { MeetingWaitingRoom } from "@features/meeting/meeting-waiting-room/meeting-waiting-room";
import { MeetingWebSocketService } from "@shared/services/meeting-websocket";
import { ParticipantType } from "@shared/types/ParticipantType";
import { StreamsType } from "@shared/types/StreamsType";

@Component({
    selector: "app-meeting",
    imports: [MeetingControlsItem, MeetingParticipant, MeetingWaitingRoom],
    templateUrl: "./meeting.html",
    styleUrl: "./meeting.css"
})
export class Meeting implements OnInit {
    protected meetingId: WritableSignal<string> = signal<string>("");
    protected isConnected: WritableSignal<boolean> = signal<boolean>(false);

    protected isSidebarExpanded: WritableSignal<boolean> = signal<boolean>(false);

    private meetingWebSocketService: MeetingWebSocketService = inject(MeetingWebSocketService);
    private activatedRoute: ActivatedRoute = inject(ActivatedRoute);

    protected participants: WritableSignal<ParticipantType[]> = linkedSignal<Record<string, StreamsType>, ParticipantType[]>({
        source: this.meetingWebSocketService.remoteStreams,
        computation: (newRemoteStreams: Record<string, StreamsType>, previousParticipants: { source: Record<string, StreamsType>, value: ParticipantType[] } | undefined) => {
            return [...Object.entries(newRemoteStreams).map((remoteStream: [string, StreamsType]) => {
                const socketId: string = remoteStream[0];

                const previousParticipant: ParticipantType | undefined = previousParticipants?.value.find((participant: ParticipantType) => participant.id === socketId);

                return {
                    id: socketId,
                    name: `User ${socketId}`,
                    isAudioEnabled: true,
                    isVideoEnabled: true,
                    audioStream: remoteStream[1].audioStream,
                    videoStream: remoteStream[1].videoStream,
                    isMoved: false,
                    isLocal: false
                };
            }), {
                id: "1",
                name: `This user`,
                isAudioEnabled: true,
                isVideoEnabled: true,
                audioStream: this.meetingWebSocketService.localAudioStream(),
                videoStream: this.meetingWebSocketService.localVideoStream(),
                isMoved: false,
                isLocal: true
            }];
        }
    });

    protected participantsAmount: Signal<number> = computed<number>(() => this.participants().length);

    private participantsWrapper: Signal<ElementRef<HTMLDivElement> | undefined> = viewChild<ElementRef<HTMLDivElement>>("participantsWrapper");

    constructor() {
        effect(() => {
            if (this.isConnected() && this.participantsWrapper() && this.participantsAmount()) {
                untracked(() => {
                    const updatedParticipants: ParticipantType[] = this.participants().map((participant: ParticipantType) => ({
                        ...participant,
                        isMoved: false
                    }));

                    let { rows, columns } = this.getOptimalParticipantsLayout(this.participantsWrapper()!.nativeElement, this.participantsAmount());

                    this.participantsWrapper()!.nativeElement.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
                    this.participantsWrapper()!.nativeElement.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

                    if (this.participantsAmount() % 2 && rows > 1) {
                        for (let i = 0; i < this.participantsAmount() - (rows - 1) * columns; i++) {
                            updatedParticipants[(rows - 1) * columns + i].isMoved = true;
                        }
                    }

                    this.participants.set(updatedParticipants);
                });
            }
        });
    }

    ngOnInit(): void {
        this.activatedRoute.params.subscribe(async (params: Params) => {
            const roomId: string | undefined = params["id"];

            if (roomId) {
                this.meetingId.set(roomId);
            }
        });
    }

    ngOnDestroy(): void {
        this.meetingWebSocketService.leave(this.meetingId());
    }

    protected joinMeeting(): void {
        this.meetingWebSocketService.connect(this.meetingId());

        this.isConnected.set(true);
    }

    private getOptimalParticipantsLayout(wrapperElement: HTMLElement, participantsAmount: number): { rows: number, columns: number } {
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