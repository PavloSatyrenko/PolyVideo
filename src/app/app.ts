import { Component, inject, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { AuthService } from "@shared/services/auth.service";

@Component({
    selector: "app-root",
    imports: [RouterOutlet],
    template: "<router-outlet></router-outlet>",
})
export class App implements OnInit {
    private authService: AuthService = inject(AuthService);

    async ngOnInit(): Promise<void> {
        await this.authService.init();
    }
}
