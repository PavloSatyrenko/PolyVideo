import { computed, Injectable, Signal, signal, WritableSignal } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class NotificationService {
    private internalHeader: WritableSignal<string> = signal<string>("");
    private internalMessage: WritableSignal<string> = signal<string>("");
    private internalType: WritableSignal<"info" | "error"> = signal<"info" | "error">("info");
    private internalIsVisible: WritableSignal<boolean> = signal<boolean>(false);

    public header: Signal<string> = computed(() => this.internalHeader());
    public message: Signal<string> = computed(() => this.internalMessage());
    public type: Signal<"info" | "error"> = computed(() => this.internalType());
    public isVisible: Signal<boolean> = computed(() => this.internalIsVisible());

    private messageVisibleTimeout: ReturnType<typeof setTimeout> | null = null;

    public showNotification(header: string, message: string, type: "info" | "error" = "info", visibleTime: number = 5000): void {
        if (this.messageVisibleTimeout) {
            clearTimeout(this.messageVisibleTimeout);
            this.messageVisibleTimeout = null;
        }

        this.internalIsVisible.set(false);

        this.messageVisibleTimeout = setTimeout(() => {
            this.internalHeader.set(header);
            this.internalMessage.set(message);
            this.internalType.set(type);
            this.internalIsVisible.set(true);
        }, 300);

        if (visibleTime !== 0) {
            this.messageVisibleTimeout = setTimeout(() => {
                this.internalIsVisible.set(false);
                this.messageVisibleTimeout = null;
            }, visibleTime + 300);
        }
    }

    public hideNotification(): void {
        if (this.messageVisibleTimeout) {
            clearTimeout(this.messageVisibleTimeout);
            this.messageVisibleTimeout = null;
        }

        this.internalIsVisible.set(false);
    }
}
