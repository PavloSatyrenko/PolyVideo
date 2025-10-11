import { Routes } from "@angular/router";

export const meetingsRoutes: Routes = [
    {
        path: "",
        loadComponent: () => import("@pages/meetings/meetings").then(m => m.Meetings),
    }
];
