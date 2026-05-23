import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const authKey = 'sigps_auth';
    const storedAuth = typeof localStorage !== 'undefined' ? localStorage.getItem(authKey) : null;

    let authReq = req;

    if (storedAuth) {
        // O AuthService salva o token diretamente como string pura (ex: "eyJhbG..."),
        // então não precisamos fazer JSON.parse. Se for um JSON stringificado, removemos as aspas.
        const token = storedAuth.startsWith('{') ? JSON.parse(storedAuth).token : storedAuth.replace(/^"|"$/g, '');

        if (token) {
            authReq = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }
    }

    return next(authReq).pipe(
        catchError((error: any) => {
            if (error instanceof HttpErrorResponse) {
                // Se o status for 401 (Não autorizado), significa que o token expirou ou é inválido
                if (error.status === 401) {
                    console.warn('Sessão expirada. Redirecionando para o login.');
                    // Limpa o estado de autenticação no serviço e no localStorage
                    authService.logout();
                    // Redireciona o usuário imediatamente para a tela de login
                    router.navigate(['/login']);
                }
            }
            return throwError(() => error);
        })
    );
};
