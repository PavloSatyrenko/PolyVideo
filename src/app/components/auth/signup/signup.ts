import { Component, inject, signal, WritableSignal } from "@angular/core";
import { Button } from "@shared/components/button/button";
import { Input } from "@shared/components/input/input";
import { Title } from "@shared/components/title/title";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "@shared/services/auth.service";

@Component({
    selector: "app-auth-signup",
    imports: [Title, Input, Button, RouterLink],
    templateUrl: "./signup.html",
    styleUrl: "./signup.css",
})
export class Signup {
    protected email: WritableSignal<string> = signal("");
    protected name: WritableSignal<string> = signal("");
    protected surname: WritableSignal<string> = signal("");
    protected password: WritableSignal<string> = signal("");
    protected confirmPassword: WritableSignal<string> = signal("");

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
            case "name":
                return this.name().length > 0;
            case "surname":
                return this.surname().length > 0;
            case "password":
                return this.password().length >= 8;
            case "confirmPassword":
                return this.confirmPassword() === this.password() && this.confirmPassword().length >= 8;
        }

        return false;
    }

    protected async signUp(): Promise<void> {
        this.hasSubmitted.set(true);

        const fields: string[] = ["email", "name", "surname", "password", "confirmPassword"];
        for (const field of fields) {
            if (!this.isFieldValid(field)) {
                return;
            }
        }

        await this.authService.signUp(
            this.email(),
            this.name(),
            this.surname(),
            this.password(),
        ).then(() => {
            const returnUrl: string = this.router.parseUrl(this.router.url).queryParams["redirect"] || "/";

            this.router.navigate([returnUrl]);
        }).catch((error: unknown) => {
            console.error("Sign Up Error:", error);
        });
    }
}
