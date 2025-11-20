import { Component, computed, inject, OnDestroy, OnInit, Signal, signal, WritableSignal } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { Room } from "@components/conference/room/room";
import { WaitingRoom } from "@components/conference/waiting-room/waiting-room";
import { AuthService } from "@shared/services/auth.service";
import { ConferenceWebsocket } from "@shared/services/conference-websocket";

@Component({
    selector: "app-layout-conference",
    imports: [WaitingRoom, Room],
    templateUrl: "./conference.html",
    styleUrl: "./conference.css"
})
export class Conference implements OnInit, OnDestroy {
    protected conferenceCode: WritableSignal<string> = signal<string>("");

    protected isConferenceExists: Signal<boolean> = computed<boolean>(() => this.conferenceWebSocket.isConferenceExists());

    protected isJoining: Signal<boolean> = computed<boolean>(() => this.conferenceWebSocket.isJoining());
    protected isConnected: Signal<boolean> = computed<boolean>(() => this.conferenceWebSocket.isConnected());

    private routeSubscription: any;

    private conferenceWebSocket: ConferenceWebsocket = inject(ConferenceWebsocket);
    private authService: AuthService = inject(AuthService);
    private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
    private router: Router = inject(Router);

    ngOnInit(): void {
        this.routeSubscription = this.activatedRoute.params.subscribe(async (params: Params) => {
            const roomCode: string | undefined = params["code"];

            if (!roomCode) {
                this.router.navigate(["/"]);
                return;
            }

            await this.conferenceWebSocket.setMeetingByCode(roomCode);

            if (!this.isConferenceExists()) {
                this.router.navigate(["/"]);
                return;
            }

            if (roomCode) {
                this.conferenceCode.set(roomCode);
            }
        });
    }

    ngOnDestroy(): void {
        this.conferenceWebSocket.leave();
        this.routeSubscription.unsubscribe();
    }

    protected joinConference(): void {
        if (!this.conferenceWebSocket.meeting()?.isGuestAllowed && !this.authService.user()){
            alert("You must be logged in to join this conference.");
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