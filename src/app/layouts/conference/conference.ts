import { Component, inject, OnDestroy, OnInit, signal, WritableSignal } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
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
    protected isConnected: WritableSignal<boolean> = signal<boolean>(false);

    private conferenceWebSocket: ConferenceWebsocket = inject(ConferenceWebsocket);
    private activatedRoute: ActivatedRoute = inject(ActivatedRoute);

    ngOnInit(): void {
        this.activatedRoute.params.subscribe(async (params: Params) => {
            const roomId: string | undefined = params["id"];

            if (roomId) {
                this.conferenceId.set(roomId);
            }
        });
    }

    ngOnDestroy(): void {
        this.conferenceWebSocket.leave(this.conferenceId());
    }

    protected joinConference(): void {
        this.conferenceWebSocket.connect(this.conferenceId());

        this.isConnected.set(true);
    }
}