import { Routes } from "@angular/router";
import { authGuard } from "@shared/guards/auth-guard";
import { mainRouteGuard } from "@shared/guards/main-route-guard";

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
                path: "main",
                loadChildren: () => import("./layouts/main/main.routes").then(m => m.authRoutes)
            },
            {
                path: "redirect",
                canActivate: [mainRouteGuard],
                loadComponent: () => import("./layouts/empty/empty").then(m => m.Empty)
            },
            {
                path: "",
                redirectTo: "redirect",
                pathMatch: "full"
            },
            {
                path: "**",
                redirectTo: "redirect",
            }
        ]
    }
];
