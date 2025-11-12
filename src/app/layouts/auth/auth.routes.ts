import { Routes } from "@angular/router";

export const authRoutes: Routes = [
    {
        path: "",
        loadComponent: () => import("@layouts/auth/auth").then(m => m.Auth),
        children: [
            {
                path: "login",
                loadComponent: () => import("@components/auth/login/login").then(m => m.Login)
            },
            {
                path: "signup",
                loadComponent: () => import("@components/auth/signup/signup").then(m => m.Signup)
            },
            {
                path: "",
                redirectTo: "login",
                pathMatch: "full"
            }
        ]
    }
];
