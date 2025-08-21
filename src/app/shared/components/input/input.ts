import { CommonModule } from "@angular/common";
import { Component, input, InputSignal, model, ModelSignal } from "@angular/core";

@Component({
    selector: "ui-input",
    imports: [CommonModule],
    templateUrl: "./input.html",
    styleUrl: "./input.css",
})
export class Input {
    public readonly placeholder: InputSignal<string> = input<string>("");
    public readonly size: InputSignal<"small" | "large"> = input<"small" | "large">("small");
    public readonly theme: InputSignal<"default" | "primary"> = input<"default" | "primary">("primary");
    public readonly type: InputSignal<"text" | "number"> = input<"text" | "number">("text");
    public readonly minNumber: InputSignal<number> = input<number>(0);
    public readonly maxNumber: InputSignal<number> = input<number>(Infinity);
    public isDisabled: InputSignal<boolean> = input<boolean>(false);

    public value: ModelSignal<string | number> = model<string | number>("");

    handleInput(event: Event): void {
        const target: HTMLInputElement = event.target as HTMLInputElement;
        const newValue: string = target.value;

        if (this.type() == "number") {
            let newNumericValue: number = parseInt(newValue.replaceAll(/[^0-9]/g, "")) || 0;

            this.value.set(newNumericValue);
            target.value = newNumericValue.toString();
        }
        else {
            this.value.set(newValue);
        }
    }

    onChange(event: Event): void {
        if (this.type() == "number") {
            let newNumericValue: number = parseInt((event.target as HTMLInputElement).value.replaceAll(/[^0-9]/g, "")) || 0;

            if (newNumericValue < this.minNumber()) {
                newNumericValue = this.minNumber();
            }
            else if (newNumericValue > this.maxNumber()) {
                newNumericValue = this.maxNumber();
            }

            (event.target as HTMLInputElement).value = newNumericValue.toString();
        }
    }
}
