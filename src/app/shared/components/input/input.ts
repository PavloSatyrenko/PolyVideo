import { CommonModule } from "@angular/common";
import { Component, computed, forwardRef, input, InputSignal, Signal, signal, WritableSignal } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
    selector: "ui-input",
    imports: [CommonModule],
    templateUrl: "./input.html",
    styleUrl: "./input.css",
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => Input),
        multi: true
    }]
})
export class Input {
    public readonly placeholder: InputSignal<string | undefined> = input<string>();
    public readonly size: InputSignal<"small" | "large" | undefined> = input<"small" | "large">();
    public readonly type: InputSignal<"default" | "primary" | undefined> = input<"default" | "primary">();

    private internalValue: WritableSignal<string> = signal<string>("");
    protected value: Signal<string> = computed<string>(() => this.internalValue());

    private isTouched: boolean = false;
    protected isDisabled: WritableSignal<boolean> = signal<boolean>(false);

    private onChange: (value: string) => void = () => { };
    private onTouched: () => void = () => { };

    handleInput(event: Event) {
        const newValue: string = (event.target as HTMLInputElement).value;
        this.internalValue.set(newValue);
        this.onChange(newValue);
    }

    markAsTouched() {
        if (!this.isTouched) {
            this.isTouched = true;
            this.onTouched();
        }
    }

    writeValue(value: string): void {
        this.internalValue.set(value ?? "");
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled.set(isDisabled);
    }
}
