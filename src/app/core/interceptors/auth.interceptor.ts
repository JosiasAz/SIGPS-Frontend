import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authKey = 'sigps_auth';
    const storedAuth = typeof localStorage !== 'undefined' ? localStorage.getItem(authKey) : null;

    if (storedAuth) {
        // O AuthService salva o token diretamente como string pura (ex: "eyJhbG..."),
        // então não precisamos fazer JSON.parse. Se for um JSON stringificado, removemos as aspas.
        const token = storedAuth.startsWith('{') ? JSON.parse(storedAuth).token : storedAuth.replace(/^"|"$/g, '');

        if (token) {
            const authReq = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
            return next(authReq);
        }
    }

    return next(req);
};
