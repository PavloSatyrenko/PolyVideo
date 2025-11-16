import { NgClass } from "@angular/common";
import { Component, input, InputSignal, output, OutputEmitterRef } from "@angular/core";
import { ConferenceControlsItemType } from "@shared/types/ConferenceControlsItemType";

@Component({
    selector: "app-conference-controls-item",
    imports: [NgClass],
    templateUrl: "./controls-item.html",
    styleUrl: "./controls-item.css"
})
export class ControlsItem {
    public item: InputSignal<ConferenceControlsItemType> = input.required<ConferenceControlsItemType>();

    public click: OutputEmitterRef<string> = output<string>();

    protected itemClick(event: Event): void {
        event.preventDefault();
        event.stopPropagation();

        this.click.emit(this.item().type);
    }
}
