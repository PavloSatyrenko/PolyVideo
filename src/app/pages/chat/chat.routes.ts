import { Routes } from "@angular/router";

export const chatRoutes: Routes = [
    {
        path: "",
        loadComponent: () => import("@pages/chat/chat").then(m => m.Chat),
    }
];
