import { Component, computed, ElementRef, HostListener, inject, signal, Signal, viewChild, WritableSignal } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "@shared/services/auth.service";
import { Title } from "@shared/components/title/title";
import { Button } from "@shared/components/button/button";
import { Input } from "@shared/components/input/input";

@Component({
    selector: "app-workspace-topbar",
    imports: [Title, Button, Input],
    templateUrl: "./topbar.html",
    styleUrl: "./topbar.css"
})
export class Topbar {
    protected userName: Signal<string> = computed(() => {
        const user: { name: string; surname: string } | null = this.authService.user();
        return user ? user.name + " " + user.surname : "";
    });

    protected isMenuOpened: WritableSignal<boolean> = signal(false);
    protected menuContent: Signal<ElementRef<HTMLDivElement> | undefined> = viewChild<ElementRef<HTMLDivElement> | undefined>("menu");

    protected isSettingsOpened: WritableSignal<boolean> = signal(false);
    protected popupContent: Signal<ElementRef<HTMLDivElement> | undefined> = viewChild<ElementRef<HTMLDivElement> | undefined>("popup");

    protected newUserName: WritableSignal<string> = signal(""); 
    protected newUserSurname: WritableSignal<string> = signal("");

    private authService: AuthService = inject(AuthService);
    private router: Router = inject(Router);

    protected openMenu(): void {
        this.isMenuOpened.set(true);
    }

    protected closeMenu(): void {
        this.isMenuOpened.set(false);
    }

    protected stopPropagation(event: MouseEvent): void {
        event.stopPropagation();
    }

    protected openSettingsPopup(): void {
        this.isMenuOpened.set(false);
        this.newUserName.set(this.authService.user()?.name || "");
        this.newUserSurname.set(this.authService.user()?.surname || "");
        this.isSettingsOpened.set(true);
    }

    protected saveSettings(): void {
        this.authService.updateUserName(this.newUserName(), this.newUserSurname());
        this.isSettingsOpened.set(false);
    }

    protected closeSettingsPopup(): void {
        this.isSettingsOpened.set(false);
    }

    protected async logout(): Promise<void> {
        await this.authService.logOut();
        this.router.navigate(["/"]);
    }

    @HostListener("document:click", ["$event"])
    protected onBackdropClick(event: MouseEvent): void {
        if (!this.menuContent() && !this.popupContent()) {
            return;
        }

        const targetNode: Node | null = event.target as Node | null;

        if (this.isMenuOpened()) {
            if (targetNode && this.menuContent()?.nativeElement.contains(targetNode)) {
                return;
            }

            this.closeMenu();
        }

        if (this.isSettingsOpened()) {
            if (targetNode && this.popupContent()?.nativeElement.contains(targetNode)) {
                return;
            }

            this.closeSettingsPopup();
        }
    }

    @HostListener("document:keydown", ["$event"])
    protected onDocumentKeyDown(event: KeyboardEvent): void {
        if (!this.menuContent() && !this.popupContent()) {
            return;
        }

        if (event.key === "Escape" || event.key === "Esc") {
            event.preventDefault();

            if (this.isMenuOpened()) {
                this.closeMenu();
            }

            if (this.isSettingsOpened()) {
                this.closeSettingsPopup();
            }
        }
    }
}
