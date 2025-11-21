import { NgClass } from "@angular/common";
import { Component, computed, ElementRef, HostListener, inject, input, InputSignal, signal, Signal, viewChild, WritableSignal } from "@angular/core";
import { Title } from "@shared/components/title/title";
import { AuthService } from "@shared/services/auth.service";
import { ConferenceWebsocket } from "@shared/services/conference-websocket";
import { ParticipantType } from "@shared/types/ParticipantType";

@Component({
    selector: "app-conference-participants-sidebar",
    imports: [Title, NgClass],
    templateUrl: "./participants-sidebar.html",
    styleUrl: "./participants-sidebar.css",
})
export class ParticipantsSidebar {
    public participants: InputSignal<ParticipantType[]> = input<ParticipantType[]>([]);

    protected visibleParticipants: Signal<ParticipantType[]> = computed<ParticipantType[]>(() => this.participants()
        .filter((participant: ParticipantType) => !participant.isScreen));

    protected openedMenuParticipantId: WritableSignal<string> = signal<string>("");

    private menuContent: Signal<ElementRef<HTMLDivElement> | undefined> = viewChild<ElementRef<HTMLDivElement> | undefined>("menu");

    protected isMeetingOwner: Signal<boolean> = computed<boolean>(() => (this.conferenceWebSocket.meeting()?.ownerId || "") === this.authService.user()?.id);

    private conferenceWebSocket: ConferenceWebsocket = inject(ConferenceWebsocket);
    private authService: AuthService = inject(AuthService);

    protected isParticipantMenuOpened(participant: ParticipantType): boolean {
        return this.openedMenuParticipantId() === participant.id;
    }

    protected openParticipantMenu(participant: ParticipantType): void {
        this.openedMenuParticipantId.set(participant.id);
    }

    protected stopPropagation(event: MouseEvent): void {
        event.stopPropagation();
    }

    protected muteParticipant(participant: ParticipantType): void {
        this.conferenceWebSocket.muteUser(participant.id);
        this.closeParticipantMenu();
    }

    protected unmuteParticipant(participant: ParticipantType): void {
        this.conferenceWebSocket.unmuteUser(participant.id);
        this.closeParticipantMenu();
    }

    protected enableVideoParticipant(participant: ParticipantType): void {
        this.conferenceWebSocket.enableVideoUser(participant.id);
        this.closeParticipantMenu();
    }

    protected disableVideoParticipant(participant: ParticipantType): void {
        this.conferenceWebSocket.disableVideoUser(participant.id);
        this.closeParticipantMenu();
    }

    protected kickParticipant(participant: ParticipantType): void {
        this.conferenceWebSocket.kickUser(participant.id);
        this.closeParticipantMenu();
    }

    protected giveOwnership(participant: ParticipantType): void {
        this.conferenceWebSocket.transferOwnership(participant.userId);
        this.closeParticipantMenu();
    }

    private closeParticipantMenu(): void {
        this.openedMenuParticipantId.set("");
    }

    @HostListener("document:click", ["$event"])
    protected onBackdropClick(event: MouseEvent): void {
        if (!this.menuContent()) {
            return;
        }

        const targetNode: Node | null = event.target as Node | null;

        if (targetNode && this.menuContent()?.nativeElement.contains(targetNode)) {
            return;
        }

        this.closeParticipantMenu();
    }

    @HostListener("document:keydown", ["$event"])
    protected onDocumentKeyDown(event: KeyboardEvent): void {
        if (!this.menuContent()) {
            return;
        }

        if (event.key === "Escape" || event.key === "Esc") {
            event.preventDefault();

            this.closeParticipantMenu();
        }
    }
}
