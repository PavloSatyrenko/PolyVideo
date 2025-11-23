import { Component, computed, inject, signal, Signal, WritableSignal } from "@angular/core";
import { Router, RouterLinkWithHref } from "@angular/router";
import { AuthService } from "@shared/services/auth.service";
import { Button } from "@shared/components/button/button";
import { Title } from "@shared/components/title/title";
import { Input } from "@shared/components/input/input";

@Component({
    selector: "app-layout-main",
    imports: [Button, RouterLinkWithHref, Title, Input],
    templateUrl: "./main.html",
    styleUrl: "./main.css",
})
export class Main {
    protected isUserAuthorized: Signal<boolean> = computed(() => !!this.authService.user());

    protected meetingCodeValue: WritableSignal<string> = signal<string>("");

    private authService: AuthService = inject(AuthService);
    private router: Router = inject(Router);

    protected joinConference(): void {
        if (this.meetingCodeValue().trim().length === 0) {
            return;
        }

        this.router.navigate(["/conference", this.meetingCodeValue()])
    }
}
