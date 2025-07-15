import { Routes } from "@angular/router";

export const meetingsRoutes: Routes = [
    {
        path: "",
        loadComponent: () => import("@features/meetings/meetings").then(m => m.Meetings),
        children: [
            {
                path: "create",
                loadComponent: () => import("@features/meetings/meetings-create/meetings-create").then(m => m.MeetingsCreate)
            }
        ]
    }
];
