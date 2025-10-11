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
                path: "documents",
                loadChildren: () => import("@pages/documents/documents.routes").then(m => m.documentsRoutes)
            },
            {
                path: "dashboards",
                loadChildren: () => import("@pages/dashboards/dashboards.routes").then(m => m.dashboardsRoutes)
            },
            {
                path: "chat",
                loadChildren: () => import("@pages/chat/chat.routes").then(m => m.chatRoutes)
            },
            {
                path: "calendar",
                loadChildren: () => import("@pages/calendar/calendar.routes").then(m => m.calendarRoutes)
            },
            {
                path: "",
                redirectTo: "meetings",
                pathMatch: "full"
            }
        ]
    }
];