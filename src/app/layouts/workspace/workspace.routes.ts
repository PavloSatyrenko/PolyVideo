import { Routes } from "@angular/router";

export const workspaceRoutes: Routes = [
    {
        path: "",
        loadComponent: () => import("./workspace").then(m => m.Workspace)
    }
];