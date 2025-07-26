import { Routes } from "@angular/router";

export const meetingRoutes: Routes = [
    {
        path: ":id",
        loadComponent: () => import("./meeting").then(m => m.Meeting),
    },
    {
        path: "",
        redirectTo: "/workspace/meetings/invalid-code",
        pathMatch: "full"
    },
];
