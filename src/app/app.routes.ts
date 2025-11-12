import { Routes } from "@angular/router";

export const routes: Routes = [
    {
        path: "",
        children: [
            {
                path: "workspace",
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
