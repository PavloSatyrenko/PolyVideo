import { Component, computed, effect, ElementRef, HostListener, inject, Signal, signal, untracked, viewChild, WritableSignal } from "@angular/core";
import { Participant } from "@components/conference/participant/participant";
import { ControlsItem } from "@components/conference/controls-item/controls-item";
import { ParticipantsSidebar } from "@components/conference/participants-sidebar/participants-sidebar";
import { ChatSidebar } from "@components/conference/chat-sidebar/chat-sidebar";
import { ParticipantType } from "@shared/types/ParticipantType";
import { ConferenceControlsItemType } from "@shared/types/ConferenceControlsItemType";
import { ConferenceWebsocket } from "@shared/services/conference-websocket";
import { RemotePeerType } from "@shared/types/RemotePeerType";
import { Router } from "@angular/router";
import { MessageType } from "@shared/types/MessageType";
import { OptionsSidebar } from "../options-sidebar/options-sidebar";
import { MeetingType } from "@shared/types/MeetingType";
import { Button } from "@shared/components/button/button";
import { Title } from "@shared/components/title/title";
import { AuthService } from "@shared/services/auth.service";
import { NotificationService } from "@shared/services/notification.service";

@Component({
    selector: "app-conference-room",
    imports: [Participant, ControlsItem, ParticipantsSidebar, ChatSidebar, OptionsSidebar, Title, Button],
    templateUrl: "./room.html",
    styleUrl: "./room.css"
})
export class Room {
    protected meeting: Signal<MeetingType | null> = computed<MeetingType | null>(() => this.conferenceWebSocket.meeting());

    protected isParticipantsSidebarOpened: WritableSignal<boolean> = signal<boolean>(false);
    protected isChatSidebarOpened: WritableSignal<boolean> = signal<boolean>(false);
    protected isOptionsSidebarOpened: WritableSignal<boolean> = signal<boolean>(false);

    protected isSidebarOpened: Signal<boolean> = computed<boolean>(() => this.isParticipantsSidebarOpened() || this.isChatSidebarOpened() || this.isOptionsSidebarOpened());

    protected participants: WritableSignal<ParticipantType[]> = signal([]);

    protected pinnedParticipantId: WritableSignal<string | null> = signal<string | null>(null);
    protected pinnedParticipant: Signal<ParticipantType | null> = computed<ParticipantType | null>(() => {
        return this.participants().find((participant: ParticipantType) => participant.id === this.pinnedParticipantId()) || null;
    });

    protected showedParticipant: Signal<ParticipantType[]> = computed<ParticipantType[]>(() => {
        return this.participants().filter((participant: ParticipantType) => participant.id !== this.pinnedParticipant()?.id);
    });

    private participantsWrapper: Signal<ElementRef<HTMLDivElement> | undefined> = viewChild<ElementRef<HTMLDivElement>>("participantsWrapper");

    protected isRequestedEnableVideoByOwner: Signal<boolean> = computed<boolean>(() => this.conferenceWebSocket.isRequestedEnableVideoByOwner() && !this.isRequestedUnmuteByOwner());
    protected isRequestedUnmuteByOwner: Signal<boolean> = computed<boolean>(() => this.conferenceWebSocket.isRequestedUnmuteByOwner());

    protected requestsToJoin: Signal<{ name: string, socketId: string }[]> = computed<{ name: string, socketId: string }[]>(() => this.conferenceWebSocket.requestsToJoin());
    protected firstRequestToJoin: Signal<{ name: string, socketId: string }> = computed<{ name: string, socketId: string }>(() => this.requestsToJoin().length > 0 ? this.requestsToJoin()[0] : { name: "", socketId: "" });
    protected isRequestToJoinPopupVisible: Signal<boolean> = computed<boolean>(() => this.requestsToJoin().length > 0);

    private popupContent: Signal<ElementRef<HTMLDivElement> | undefined> = viewChild<ElementRef<HTMLDivElement> | undefined>("popup");

    protected messages: Signal<MessageType[]> = computed<MessageType[]>(() => this.conferenceWebSocket.chatMessages());

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
            isEnabled: this.isParticipantsSidebarOpened()
        },
        {
            type: "chat",
            isEnabled: this.isChatSidebarOpened()
        },
        {
            type: "hand",
            isEnabled: this.conferenceWebSocket.isHandUp()
        },
        {
            type: "other",
            isEnabled: this.isOptionsSidebarOpened()
        },
        {
            type: "leave",
        }
    ]);

    private conferenceWebSocket: ConferenceWebsocket = inject(ConferenceWebsocket);
    private authService: AuthService = inject(AuthService);
    private notificationService: NotificationService = inject(NotificationService);
    private router: Router = inject(Router);

    constructor() {
        effect(() => {
            if (this.participantsWrapper()) {
                const participantsAmount: number = this.showedParticipant().length;

                let { rows, columns } = this.getOptimalParticipantsLayout(this.participantsWrapper()!.nativeElement, participantsAmount);

                document.documentElement.style.setProperty("--columns", columns.toString());
                document.documentElement.style.setProperty("--rows", rows.toString());
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
                        userId: peer.userId,
                        name: `${peer.name} screen`,
                        isAudioEnabled: false,
                        isVideoEnabled: true,
                        audioStream: new MediaStream(),
                        videoStream: peer.screenShareStream,
                        isLocal: false,
                        isHandUp: false,
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
                        isHandUp: remotePeers[participant.id].isHandUp
                    };
                }
                else {
                    return {
                        id: socketId,
                        userId: peer.userId,
                        name: peer.name,
                        isAudioEnabled: peer.isAudioEnabled,
                        isVideoEnabled: peer.isVideoEnabled,
                        audioStream: peer.audioStream,
                        videoStream: peer.videoStream,
                        isLocal: false,
                        isHandUp: peer.isHandUp,
                        isScreen: false
                    };
                }
            });

            updatedParticipants.push(...screenStreams);

            updatedParticipants.unshift({
                id: "local",
                userId: this.authService.user()?.id || "",
                name: this.conferenceWebSocket.localName(),
                isAudioEnabled: this.conferenceWebSocket.isAudioEnabled(),
                isVideoEnabled: this.conferenceWebSocket.isVideoEnabled(),
                audioStream: new MediaStream(),
                videoStream: this.conferenceWebSocket.localVideoStream(),
                isLocal: true,
                isHandUp: this.conferenceWebSocket.isHandUp(),
                isScreen: false
            });

            if (this.conferenceWebSocket.isScreenSharing()) {
                updatedParticipants.unshift({
                    id: "local-screen",
                    userId: this.authService.user()?.id || "",
                    name: this.conferenceWebSocket.localName() + " screen",
                    isAudioEnabled: false,
                    isVideoEnabled: true,
                    audioStream: new MediaStream(),
                    videoStream: this.conferenceWebSocket.localScreenShareStream(),
                    isLocal: true,
                    isHandUp: false,
                    isScreen: true
                });
            }

            this.participants.set(updatedParticipants);

            if (this.participants().length === 1) {
                this.pinnedParticipantId.set(null);
            }
        });
    }

    private getOptimalParticipantsLayout(wrapperElement: HTMLElement, participantsAmount: number): { rows: number, columns: number } {
        const optimalLayout: { rows: number, columns: number } = {
            rows: 1,
            columns: participantsAmount
        };

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

    protected togglePinParticipant(participantId: string): void {
        if (this.participants().length === 1) {
            this.pinnedParticipantId.set(null);
            return;
        }

        if (this.pinnedParticipantId() === participantId) {
            this.pinnedParticipantId.set(null);
        }
        else {
            this.pinnedParticipantId.set(participantId);
        }
    }

    protected handleControlItemClick(type: string): void {
        switch (type) {
            case "audio":
                this.conferenceWebSocket.toggleAudio();
                break;
            case "video":
                this.conferenceWebSocket.toggleVideo();
                break;
            case "screen":
                if (this.meeting()?.isScreenSharing) {
                    this.conferenceWebSocket.toggleScreenShare();
                }
                else {
                    if (this.conferenceWebSocket.isScreenSharing()) {
                        this.conferenceWebSocket.toggleScreenShare();
                    }
                    else {
                        this.notificationService.showNotification("Not Allowed", "Screen sharing is not permitted in this meeting.", "info", 5000);
                    }
                }
                break;
            case "participants":
                this.isParticipantsSidebarOpened.set(!this.isParticipantsSidebarOpened());
                this.isChatSidebarOpened.set(false);
                this.isOptionsSidebarOpened.set(false);
                break;
            case "chat":
                this.isChatSidebarOpened.set(!this.isChatSidebarOpened());
                this.isParticipantsSidebarOpened.set(false);
                this.isOptionsSidebarOpened.set(false);
                break;
            case "hand":
                this.conferenceWebSocket.toggleHand();
                break;
            case "other":
                this.isOptionsSidebarOpened.set(!this.isOptionsSidebarOpened());
                this.isParticipantsSidebarOpened.set(false);
                this.isChatSidebarOpened.set(false);
                break;
            case "leave":
                this.conferenceWebSocket.leave();
                this.router.navigate(["/"]);
                break;
        }
    }

    protected enableVideo(): void {
        if (!this.conferenceWebSocket.isVideoEnabled()) {
            this.conferenceWebSocket.toggleVideo();
        }

        this.conferenceWebSocket.isRequestedEnableVideoByOwner.set(false);
    }

    protected declineEnableVideo(): void {
        this.conferenceWebSocket.isRequestedEnableVideoByOwner.set(false);
    }

    protected unmute(): void {
        if (!this.conferenceWebSocket.isAudioEnabled()) {
            this.conferenceWebSocket.toggleAudio();
        }

        this.conferenceWebSocket.isRequestedUnmuteByOwner.set(false);
    }

    protected declineUnmute(): void {
        this.conferenceWebSocket.isRequestedUnmuteByOwner.set(false);
    }

    protected approveRequestToJoin(): void {
        const request: { name: string, socketId: string } = this.firstRequestToJoin();

        this.conferenceWebSocket.approveRequestToJoin(request.socketId);
    }

    protected declineRequestToJoin(): void {
        const request: { name: string, socketId: string } = this.firstRequestToJoin();

        this.conferenceWebSocket.declineRequestToJoin(request.socketId);
    }

    @HostListener("document:click", ["$event"])
    protected onBackdropClick(event: MouseEvent): void {
        if (!this.popupContent()) {
            return;
        }

        const targetNode: Node | null = event.target as Node | null;

        if (targetNode && this.popupContent()?.nativeElement.contains(targetNode)) {
            return;
        }

        if (this.isRequestedUnmuteByOwner()) {
            this.declineUnmute();
            return;
        }

        if (this.isRequestedEnableVideoByOwner()) {
            this.declineEnableVideo();
        }

        if (this.isRequestToJoinPopupVisible()) {
            this.declineRequestToJoin();
        }
    }

    @HostListener("document:keydown", ["$event"])
    protected onDocumentKeyDown(event: KeyboardEvent): void {
        if (!this.popupContent()) {
            return;
        }

        if (event.key === "Escape" || event.key === "Esc") {
            event.preventDefault();

            if (this.isRequestedUnmuteByOwner()) {
                this.declineUnmute();
                return;
            }

            if (this.isRequestedEnableVideoByOwner()) {
                this.declineEnableVideo();
            }

            if (this.isRequestToJoinPopupVisible()) {
                this.declineRequestToJoin();
            }
        }
    }
}