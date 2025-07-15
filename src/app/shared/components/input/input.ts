import { CommonModule } from "@angular/common";
import { Component, input, InputSignal } from "@angular/core";

@Component({
    selector: "ui-input",
    imports: [CommonModule],
    templateUrl: "./input.html",
    styleUrl: "./input.css"
})
export class Input {
    public readonly placeholder: InputSignal<string | undefined> = input<string>();
    public readonly size: InputSignal<"small" | "large" | undefined> = input<"small" | "large">();
    public readonly type: InputSignal<"default" | "primary" | undefined> = input<"default" | "primary">();
}
