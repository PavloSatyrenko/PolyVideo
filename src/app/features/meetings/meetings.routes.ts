import { Routes } from "@angular/router";

export const meetingsRoutes: Routes = [
    {
        path: "",
        loadComponent: () => import("@features/meetings/meetings").then(m => m.Meetings),
    },
    {
        path: "create",
        loadComponent: () => import("@features/meetings/meetings-create/meetings-create").then(m => m.MeetingsCreate)
    },
    {
        path: "invalid-code",
        loadComponent: () => import("@features/meetings/meetings-invalid-code/meetings-invalid-code").then(m => m.MeetingsInvalidCode)
    }
];
