import { Component, inject, signal, WritableSignal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { Input } from "@shared/components/input/input";
import { Title } from "@shared/components/title/title";
import { Button } from "@shared/components/button/button";
import { AuthService } from "@shared/services/auth.service";
import { NotificationService } from "@shared/services/notification.service";

@Component({
    selector: "app-auth-login",
    imports: [Title, Input, Button, RouterLink],
    templateUrl: "./login.html",
    styleUrl: "./login.css",
})
export class Login {
    protected email: WritableSignal<string> = signal("");
    protected password: WritableSignal<string> = signal("");

    protected hasSubmitted: WritableSignal<boolean> = signal(false);

    private authService: AuthService = inject(AuthService);
    private notificationService: NotificationService = inject(NotificationService);
    private router: Router = inject(Router);

    protected isFieldValid(field: string): boolean {
        if (!this.hasSubmitted()) {
            return true;
        }

        switch (field) {
            case "email":
                return this.email().length > 0 && /^[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}$/i.test(this.email());
            case "password":
                return this.password().length >= 8;
        }

        return false;
    }

    protected async logIn(): Promise<void> {
        this.hasSubmitted.set(true);

        const fields: string[] = ["email", "password"];
        for (const field of fields) {
            if (!this.isFieldValid(field)) {
                this.notificationService.showNotification("Invalid Input", `Please enter a valid ${field}.`, "error", 5000);
                return;
            }
        }

        await this.authService.logIn(
            this.email(),
            this.password(),
        ).then(() => {
            const returnUrl: string = this.router.parseUrl(this.router.url).queryParams["redirect"] || "/";

            this.router.navigate([returnUrl]);
        }).catch((response: unknown) => {
            console.error("Log in Error:", response);

            if (response && typeof response === "object" && "error" in response && "status" in response) {
                if (response.status === 400) {
                    this.notificationService.showNotification("Log In Failed", "Please check your credentials and try again.", "error", 5000);
                    return;
                }
            }
            
            this.notificationService.showNotification("Log In Failed", "An error occurred during log in. Please try again.", "error", 5000);
        });
    }
}
