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
                path: "meeting",
                loadChildren: () => import("./layouts/meeting/meeting.routes").then(m => m.meetingRoutes)
            },
            {
                path: "",
                redirectTo: "workspace",
                pathMatch: "full"
            }
        ]
    }
];
