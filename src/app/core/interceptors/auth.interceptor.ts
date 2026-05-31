import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { getStoredToken } from '../../utils/auth-storage';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const token = getStoredToken();

    let authReq = req;
    if (token) {
        authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        });
    }

    return next(authReq).pipe(
        catchError((error: any) => {
            if (error instanceof HttpErrorResponse) {
                if (error.status === 401) {
                    console.warn('Sessão expirada. Redirecionando para o login.');
                    authService.logout();
                    router.navigate(['/login']);
                }
                if (error.status === 429) {
                    const msg = error.error?.message
                        || 'Muitas requisições. Aguarde um momento e tente novamente.';
                    console.warn(msg);
                }
            }
            return throwError(() => error);
        })
    );
};
