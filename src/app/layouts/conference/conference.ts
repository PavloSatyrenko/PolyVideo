import { Component, inject, OnInit, signal, WritableSignal } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { Room } from "@components/conference/room/room";
import { WaitingRoom } from "@components/conference/waiting-room/waiting-room";

@Component({
    selector: "app-layout-conference",
    imports: [WaitingRoom, Room],
    templateUrl: "./conference.html",
    styleUrl: "./conference.css"
})
export class Conference implements OnInit {
    protected conferenceId: WritableSignal<string> = signal<string>("");
    protected isConnected: WritableSignal<boolean> = signal<boolean>(false);

    private activatedRoute: ActivatedRoute = inject(ActivatedRoute);

    ngOnInit(): void {
        this.activatedRoute.params.subscribe(async (params: Params) => {
            const roomId: string | undefined = params["id"];

            if (roomId) {
                this.conferenceId.set(roomId);
            }
        });
    }

    protected joinConference(): void {
        this.isConnected.set(true);
    }
}