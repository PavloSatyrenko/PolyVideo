import { Component, input, InputSignal } from "@angular/core";

@Component({
    selector: "ui-title",
    imports: [],
    templateUrl: "./title.html",
    styleUrl: "./title.css"
})
export class Title {
    public title: InputSignal<string> = input.required<string>();
    public size: InputSignal<"small" | "medium" | "large"> = input<"small" | "medium" | "large">("small");
}
