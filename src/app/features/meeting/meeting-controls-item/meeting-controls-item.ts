import { Component, input, InputSignal } from "@angular/core";
import { MeetingControlsItemType } from "@shared/types/MeetingControlsItemType";

@Component({
    selector: "app-meeting-controls-item",
    imports: [],
    templateUrl: "./meeting-controls-item.html",
    styleUrl: "./meeting-controls-item.css"
})
export class MeetingControlsItem {
    public readonly type: InputSignal<MeetingControlsItemType> = input.required<MeetingControlsItemType>();
}