import { Component, inject, input, InputSignal } from "@angular/core";
import { ConferenceWebsocket } from "@shared/services/conference-websocket";
import { ConferenceControlsItemType } from "@shared/types/ConferenceControlsItemType";

@Component({
    selector: "app-conference-controls-item",
    imports: [],
    templateUrl: "./controls-item.html",
    styleUrl: "./controls-item.css"
})
export class ControlsItem {
    public item: InputSignal<ConferenceControlsItemType> = input.required<ConferenceControlsItemType>();

    private conferenceWebSocket: ConferenceWebsocket = inject(ConferenceWebsocket);

    protected toggleAudio(): void {
        this.conferenceWebSocket.toggleAudio();
    }

    protected toggleVideo(): void {
        this.conferenceWebSocket.toggleVideo();
    }

    protected toggleScreenShare(): void {
        this.conferenceWebSocket.toggleScreenShare();
    }
}
