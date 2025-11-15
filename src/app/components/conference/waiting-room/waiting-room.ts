import { Component, computed, inject, output, OutputEmitterRef, signal, Signal, WritableSignal } from "@angular/core";
import { ConferenceWebsocket } from "@shared/services/conference-websocket";
import { ControlsItem } from "@components/conference/controls-item/controls-item";
import { Title } from "@shared/components/title/title";
import { Button } from "@shared/components/button/button";
import { ConferenceControlsItemType } from "@shared/types/ConferenceControlsItemType";
import { AuthService } from "@shared/services/auth.service";
import { UserType } from "@shared/types/UserType";
import { Router } from "@angular/router";

@Component({
    selector: "app-conference-waiting-room",
    imports: [ControlsItem, Title, Button],
    templateUrl: "./waiting-room.html",
    styleUrl: "./waiting-room.css"
})
export class WaitingRoom {
    protected localVideoStream: Signal<MediaStream> = computed(() => this.conferenceWebSocket.localVideoStream());

    protected isVideoEnabled: Signal<boolean> = computed<boolean>(() => this.conferenceWebSocket.isVideoEnabled());

    protected audioControlItem: Signal<ConferenceControlsItemType> = computed<ConferenceControlsItemType>(() => ({
        type: "audio",
        isEnabled: this.conferenceWebSocket.isAudioEnabled()
    }));

    protected videoControlItem: Signal<ConferenceControlsItemType> = computed<ConferenceControlsItemType>(() => ({
        type: "video",
        isEnabled: this.conferenceWebSocket.isVideoEnabled()
    }));

    protected name: WritableSignal<string> = signal<string>("");

    public onJoinConference: OutputEmitterRef<void> = output<void>();

    private conferenceWebSocket: ConferenceWebsocket = inject(ConferenceWebsocket);
    private authService: AuthService = inject(AuthService);
    private router: Router = inject(Router);

    async ngOnInit(): Promise<void> {
        const user: UserType | null = this.authService.user();

        if (user) {
            this.name.set(`${user.name} ${user.surname}`);
        }
        else {
            this.name.set("Guest");
        }

        await this.conferenceWebSocket.getUserMedia();
    }

    protected cancelJoining(): void {
        // this.conferenceWebSocket.closeConnection();
        this.router.navigate(["/workspace", "meetings"]);
    }

    protected joinConference(): void {
        this.conferenceWebSocket.localName.set(this.name());
        this.onJoinConference.emit();
    }
}
