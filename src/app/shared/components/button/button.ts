import { CommonModule } from "@angular/common";
import { Component, EventEmitter, input, InputSignal, Output } from "@angular/core";

@Component({
    selector: "ui-button",
    imports: [CommonModule],
    templateUrl: "./button.html",
    styleUrl: "./button.css"
})
export class Button {
    public readonly label: InputSignal<string | undefined> = input<string>();
    public readonly icon: InputSignal<string | undefined> = input<string>();
    public readonly size: InputSignal<"small" | "large" | undefined> = input<"small" | "large">();
    public readonly type: InputSignal<"primary" | "secondary" | "primary-line" | undefined> = input<"primary" | "secondary" | "primary-line">();
    public readonly isDisabled: InputSignal<boolean | undefined> = input<boolean>();
    public readonly isFullWidth: InputSignal<boolean | undefined> = input<boolean>();

    @Output() public readonly click: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
}
