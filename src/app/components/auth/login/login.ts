import { Component, inject, signal, WritableSignal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { Input } from "@shared/components/input/input";
import { Title } from "@shared/components/title/title";
import { Button } from "@shared/components/button/button";
import { AuthService } from "@shared/services/auth.service";

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
                return;
            }
        }

        await this.authService.logIn(
            this.email(),
            this.password(),
        ).then(() => {
            const returnUrl: string = this.router.parseUrl(this.router.url).queryParams["redirect"] || "/";

            this.router.navigate([returnUrl]);
        }).catch((error: unknown) => {
            console.error("Log in Error:", error);
        });
    }
}
