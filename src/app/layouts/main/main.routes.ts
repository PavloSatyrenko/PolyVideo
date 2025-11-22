import { Routes } from "@angular/router";

export const authRoutes: Routes = [
    {
        path: "",
        loadComponent: () => import("@layouts/main/main").then(m => m.Main),
    }
];
