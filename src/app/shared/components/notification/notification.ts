import { NgClass } from "@angular/common";
import { Component, computed, inject, Signal } from "@angular/core";
import { NotificationService } from "@shared/services/notification.service";

@Component({
    selector: "ui-notification",
    imports: [NgClass],
    templateUrl: "./notification.html",
    styleUrl: "./notification.css",
})
export class Notification {
    protected header: Signal<string> = computed(() => this.notificationService.header());
    protected message: Signal<string> = computed(() => this.notificationService.message());
    protected type: Signal<"info" | "warning" | "error"> = computed(() => this.notificationService.type());
    protected isVisible: Signal<boolean> = computed(() => this.notificationService.isVisible());

    private notificationService: NotificationService = inject(NotificationService);

    protected hideNotification(): void {
        this.notificationService.hideNotification();
    }
}
