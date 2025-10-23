import { CommonModule } from "@angular/common";
import { Component, input, InputSignal, model, ModelSignal, output, OutputEmitterRef } from "@angular/core";

@Component({
    selector: "ui-checkbox",
    imports: [CommonModule],
    templateUrl: "./checkbox.html",
    styleUrl: "./checkbox.css"
})
export class Checkbox {
    public label: InputSignal<string> = input<string>("");
    public isDisabled: InputSignal<boolean> = input<boolean>(false);

    public value: ModelSignal<boolean> = model<boolean>(false);

    protected onChange(event: Event): void {
        const newValue: boolean = (event.target as HTMLInputElement).checked;
        this.value.set(newValue);

        event.preventDefault();
        event.stopPropagation();
    }
}