import { Component, input, InputSignal } from "@angular/core";
import { ConferenceControlsItemType } from "@shared/types/ConferenceControlsItemType";

@Component({
    selector: "app-conference-controls-item",
    imports: [],
    templateUrl: "./controls-item.html",
    styleUrl: "./controls-item.css"
})
export class ControlsItem {
    public type: InputSignal<ConferenceControlsItemType> = input.required<ConferenceControlsItemType>();
}
