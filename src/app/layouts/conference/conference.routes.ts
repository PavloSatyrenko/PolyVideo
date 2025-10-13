import { Routes } from "@angular/router";

export const conferenceRoutes: Routes = [
    {
        path: ":id",
        loadComponent: () => import("./conference").then(m => m.Conference),
    }
];
