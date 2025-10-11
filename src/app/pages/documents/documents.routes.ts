import { Routes } from "@angular/router";

export const documentsRoutes: Routes = [
    {
        path: "",
        loadComponent: () => import("@pages/documents/documents").then(m => m.Documents),
    }
];
