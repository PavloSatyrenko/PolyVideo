import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Notification } from "@shared/components/notification/notification";

@Component({
    selector: "app-layout-auth",
    imports: [RouterModule, Notification],
    templateUrl: "./auth.html",
    styleUrl: "./auth.css",
})
export class Auth { }
