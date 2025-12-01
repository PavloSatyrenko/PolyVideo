import { Routes } from "@angular/router";

export const conferenceRoutes: Routes = [
    {
        path: ":code",
        loadComponent: () => import("./conference").then(m => m.Conference),
    },
    {
        path: "",
        loadComponent: () => import("./conference").then(m => m.Conference),
    }
];
