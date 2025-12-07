import { CommonModule } from "@angular/common";
import { Component, input, InputSignal, output, OutputEmitterRef } from "@angular/core";

@Component({
    selector: "ui-button",
    imports: [CommonModule],
    templateUrl: "./button.html",
    styleUrl: "./button.css"
})
export class Button {
    public label: InputSignal<string> = input<string>("");
    public icon: InputSignal<string> = input<string>("");
    public size: InputSignal<"small" | "large"> = input<"small" | "large">("small");
    public type: InputSignal<"primary" | "primary-line"> = input<"primary" | "primary-line">("primary");
    public isDisabled: InputSignal<boolean> = input<boolean>(false);
    public isFullWidth: InputSignal<boolean> = input<boolean>(false);

    public click: OutputEmitterRef<MouseEvent> = output<MouseEvent>()

    handleClick(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.click.emit(event);
    }
}
