import { Component, computed, inject, OnDestroy, OnInit, Signal, signal, WritableSignal } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { Room } from "@components/conference/room/room";
import { WaitingRoom } from "@components/conference/waiting-room/waiting-room";
import { ConferenceWebsocket } from "@shared/services/conference-websocket";

@Component({
    selector: "app-layout-conference",
    imports: [WaitingRoom, Room],
    templateUrl: "./conference.html",
    styleUrl: "./conference.css"
})
export class Conference implements OnInit, OnDestroy {
    protected conferenceId: WritableSignal<string> = signal<string>("");

    protected isConferenceExists: Signal<boolean> = computed<boolean>(() => this.conferenceWebSocket.isConferenceExists());
    protected isConnected: WritableSignal<boolean> = signal<boolean>(false);

    private routeSubscription: any;

    private conferenceWebSocket: ConferenceWebsocket = inject(ConferenceWebsocket);
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
                this.conferenceId.set(roomCode);
            }
        });
    }

    ngOnDestroy(): void {
        this.conferenceWebSocket.leave(this.conferenceId());
        this.routeSubscription.unsubscribe();
    }

    protected joinConference(): void {
        this.conferenceWebSocket.connect(this.conferenceId());

        this.isConnected.set(true);
    }
}