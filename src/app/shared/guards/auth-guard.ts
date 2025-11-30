import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "@shared/services/auth.service";

export const authGuard: CanActivateFn = async () => {
    const authService: AuthService = inject(AuthService);
    const router: Router = inject(Router);

    if (!authService.user()) {
        await authService.getAuthenticatedUser()
            .catch(() => {
                return router.navigate(["/auth"]);
            });
    }

    if (!authService.user()) {
        return router.navigate(["/auth"]);
    }

    return true;
};
