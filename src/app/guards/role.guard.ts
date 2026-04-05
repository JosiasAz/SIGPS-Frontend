import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AbstractAuthService } from '../services/auth/abstract-auth.service';
import { UserRole } from '../models/auth.model';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
    return (route, state) => {
        const authService = inject(AbstractAuthService);
        const router = inject(Router);

        if (authService.hasRole(allowedRoles)) {
            return true;
        }

        if (authService.hasRole(['paciente'])) {
            router.navigate(['/painel/portal-paciente']);
        } else {
            router.navigate(['/painel/dashboard']);
        }
        return false;
    };
};
