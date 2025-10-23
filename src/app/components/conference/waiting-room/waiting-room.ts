import { Component, computed, inject, output, OutputEmitterRef, Signal } from "@angular/core";
import { ConferenceWebsocket } from "@shared/services/conference-websocket";
import { ControlsItem } from "@components/conference/controls-item/controls-item";
import { Title } from "@shared/components/title/title";
import { Button } from "@shared/components/button/button";
import { ConferenceControlsItemType } from "@shared/types/ConferenceControlsItemType";

@Component({
    selector: "app-conference-waiting-room",
    imports: [ControlsItem, Title, Button],
    templateUrl: "./waiting-room.html",
    styleUrl: "./waiting-room.css"
})
export class WaitingRoom {
    protected localVideoStream: Signal<MediaStream> = computed<MediaStream>(() => this.conferenceWebSocket.localVideoStream());
    protected localAudioStream: Signal<MediaStream> = computed<MediaStream>(() => this.conferenceWebSocket.localAudioStream());

    protected isVideoEnabled: Signal<boolean> = computed<boolean>(() => this.conferenceWebSocket.isVideoEnabled());

    protected audioControlItem: Signal<ConferenceControlsItemType> = computed<ConferenceControlsItemType>(() => ({
        type: "audio",
        isEnabled: this.conferenceWebSocket.isAudioEnabled()
    }));

    protected videoControlItem: Signal<ConferenceControlsItemType> = computed<ConferenceControlsItemType>(() => ({
        type: "video",
        isEnabled: this.conferenceWebSocket.isVideoEnabled()
    }));

    public onJoinConference: OutputEmitterRef<void> = output<void>();

    private conferenceWebSocket: ConferenceWebsocket = inject(ConferenceWebsocket);

    async ngOnInit(): Promise<void> {
        await this.conferenceWebSocket.getUserMedia();
    }

    protected joinConference(): void {
        this.onJoinConference.emit();
    }
}
