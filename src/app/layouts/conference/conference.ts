import { Component, computed, inject, OnDestroy, OnInit, Signal, signal, WritableSignal } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { Room } from "@components/conference/room/room";
import { WaitingRoom } from "@components/conference/waiting-room/waiting-room";
import { AuthService } from "@shared/services/auth.service";
import { ConferenceWebsocket } from "@shared/services/conference-websocket";
import { Notification } from "@shared/components/notification/notification";
import { NotificationService } from "@shared/services/notification.service";
import { Subscription } from "rxjs";

@Component({
    selector: "app-layout-conference",
    imports: [WaitingRoom, Room, Notification],
    templateUrl: "./conference.html",
    styleUrl: "./conference.css"
})
export class Conference implements OnInit, OnDestroy {
    protected conferenceCode: WritableSignal<string> = signal<string>("");

    protected isConferenceExists: Signal<boolean> = computed<boolean>(() => this.conferenceWebSocket.isConferenceExists());

    protected isJoining: Signal<boolean> = computed<boolean>(() => this.conferenceWebSocket.isJoining());
    protected isConnected: Signal<boolean> = computed<boolean>(() => this.conferenceWebSocket.isConnected());

    private routeSubscription!: Subscription;

    private conferenceWebSocket: ConferenceWebsocket = inject(ConferenceWebsocket);
    private authService: AuthService = inject(AuthService);
    private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
    private notificationService: NotificationService = inject(NotificationService);
    private router: Router = inject(Router);

    public ngOnInit(): void {
        this.routeSubscription = this.activatedRoute.params.subscribe(async (params: Params) => {
            const roomCode: string | undefined = params["code"];

            if (!roomCode) {
                this.router.navigate(["/"]);
                this.notificationService.showNotification("Invalid Room", "No room code provided in the URL.", "error", 5000);
                return;
            }

            await this.conferenceWebSocket.setMeetingByCode(roomCode);

            if (!this.isConferenceExists()) {
                this.router.navigate(["/"]);
                this.notificationService.showNotification("Room Not Found", `The room with code "${roomCode}" does not exist.`, "error", 5000);
                return;
            }

            if (roomCode) {
                this.conferenceCode.set(roomCode);
            }
        });
    }

    public ngOnDestroy(): void {
        this.conferenceWebSocket.leave();
        this.routeSubscription.unsubscribe();
    }

    protected async joinConference(): Promise<void> {
        await this.conferenceWebSocket.setMeetingByCode(this.conferenceCode());

        if (!this.conferenceWebSocket.meeting()?.isGuestAllowed && !this.authService.user()) {
            this.notificationService.showNotification("Not Allowed", "You must be logged in to join this conference.", "info", 5000);
            return;
        }

        if (!this.conferenceWebSocket.meeting()?.isWaitingRoom) {
            this.conferenceWebSocket.connect(this.conferenceCode());
        }
        else {
            this.conferenceWebSocket.requestToJoin(this.conferenceCode());
        }
    }
}