import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AbstractAuthService } from '../services/auth/abstract-auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AbstractAuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;
    }

    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
};
