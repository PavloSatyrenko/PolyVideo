import { Routes } from "@angular/router";
import { authGuard } from "@shared/guards/auth-guard";

export const routes: Routes = [
    {
        path: "",
        children: [
            {
                path: "workspace",
                canActivate: [authGuard],
                loadChildren: () => import("./layouts/workspace/workspace.routes").then(m => m.workspaceRoutes)
            },
            {
                path: "conference",
                loadChildren: () => import("./layouts/conference/conference.routes").then(m => m.conferenceRoutes)
            },
            {
                path: "auth",
                loadChildren: () => import("./layouts/auth/auth.routes").then(m => m.authRoutes)
            },
            {
                path: "",
                redirectTo: "workspace",
                pathMatch: "full"
            }
        ]
    }
];
