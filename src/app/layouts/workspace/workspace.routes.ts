import { Routes } from "@angular/router";

export const workspaceRoutes: Routes = [
    {
        path: "",
        loadComponent: () => import("./workspace").then(m => m.Workspace),
        children: [
            {
                path: "meetings",
                loadChildren: () => import("@pages/meetings/meetings.routes").then(m => m.meetingsRoutes)
            },
            {
                path: "chat",
                loadChildren: () => import("@pages/chat/chat.routes").then(m => m.chatRoutes)
            },
            {
                path: "",
                redirectTo: "meetings",
                pathMatch: "full"
            }
        ]
    }
];