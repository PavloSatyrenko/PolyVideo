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
                path: "",
                redirectTo: "workspace",
                pathMatch: "full"
            }
        ]
    }
];
