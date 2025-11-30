import { Component, computed, inject, Signal } from "@angular/core";
import { AuthService } from "@shared/services/auth.service";

@Component({
    selector: "app-workspace-topbar",
    imports: [],
    templateUrl: "./topbar.html",
    styleUrl: "./topbar.css"
})
export class Topbar {
    protected userName: Signal<string> = computed(() => {
        const user: { name: string; surname: string } | null = this.authService.user();
        return user ? user.name + " " + user.surname : "";
    });

    private authService: AuthService = inject(AuthService);
}
