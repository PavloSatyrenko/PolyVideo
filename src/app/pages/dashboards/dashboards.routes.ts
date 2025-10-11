import { Routes } from "@angular/router";

export const dashboardsRoutes: Routes = [
    {
        path: "",
        loadComponent: () => import("@pages/dashboards/dashboards").then(m => m.Dashboards),
    }
];
