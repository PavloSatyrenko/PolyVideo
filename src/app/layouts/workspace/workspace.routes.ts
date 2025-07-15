import { Routes } from "@angular/router";

export const workspaceRoutes: Routes = [
    {
        path: "",
        loadComponent: () => import("./workspace").then(m => m.Workspace),
        children: [
            {
                path: "dashboards",
                loadChildren: () => import("@features/dashboards/dashboards.routes").then(m => m.dashboardsRoutes)
            },
            {
                path: "chat",
                loadChildren: () => import("@features/chat/chat.routes").then(m => m.chatRoutes)
            },
            {
                path: "meetings",
                loadChildren: () => import("@features/meetings/meetings.routes").then(m => m.meetingsRoutes)
            },
            {
                path: "",
                redirectTo: "meetings",
                pathMatch: "full"
            }
        ]
    }
];
