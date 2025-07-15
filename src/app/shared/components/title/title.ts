import { Component, input, InputSignal } from "@angular/core";

@Component({
    selector: "ui-title",
    imports: [],
    templateUrl: "./title.html",
    styleUrl: "./title.css"
})
export class Title {
    public readonly title: InputSignal<string | undefined> = input<string>();
    public readonly size: InputSignal<"small" | "medium" | "large" | undefined> = input<"small" | "medium" | "large">();
}
