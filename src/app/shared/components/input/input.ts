import { CommonModule } from "@angular/common";
import { Component, computed, input, InputSignal, model, ModelSignal, OnInit, Signal } from "@angular/core";

@Component({
    selector: "ui-input",
    imports: [CommonModule],
    templateUrl: "./input.html",
    styleUrl: "./input.css",
})
export class Input implements OnInit {
    public label: InputSignal<string> = input<string>("");
    public placeholder: InputSignal<string> = input<string>("");
    public size: InputSignal<"small" | "large"> = input<"small" | "large">("small");
    public theme: InputSignal<"default" | "primary"> = input<"default" | "primary">("primary");
    public type: InputSignal<"text" | "number" | "password" | "email"> = input<"text" | "number" | "password" | "email">("text");
    public minNumber: InputSignal<number> = input<number>(0);
    public maxNumber: InputSignal<number> = input<number>(Infinity);
    public name: InputSignal<string> = input<string>("");
    public autocomplete: InputSignal<string> = input<string>("off");
    public isFullWidth: InputSignal<boolean> = input<boolean>(false);
    public isDisabled: InputSignal<boolean> = input<boolean>(false);
    public isValid: InputSignal<boolean> = input<boolean>(true);

    protected inputType: Signal<"text" | "password" | "email"> = computed(() => {
        if (this.type() == "password") {
            return "password";
        }
        if (this.type() == "email") {
            return "email";
        }
        return "text";
    });

    public value: ModelSignal<string | number> = model<string | number>("");

    ngOnInit(): void {
        if (this.type() == "number" && typeof this.value() !== "number") {
            this.value.set(0);
        }
    }

    handleInput(event: Event): void {
        const target: HTMLInputElement = event.target as HTMLInputElement;
        const newValue: string = target.value;

        if (this.type() == "number") {
            let newNumericValue: number = parseInt(newValue.replaceAll(/[^0-9]/g, "")) || 0;

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

            this.value.set(newNumericValue);
            (event.target as HTMLInputElement).value = newNumericValue.toString();
        }
    }
}
