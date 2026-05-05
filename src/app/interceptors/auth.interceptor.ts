import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authKey = 'sigps_auth';
    // Pega o valor do localStorage. Se for apenas o token (string), não use JSON.parse
    const token = localStorage.getItem(authKey);

    // Se o token existe, clonamos a requisição e injetamos o Header
    if (token) {
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(authReq);
    }

    // Se não houver token, a requisição segue normal (para login/cadastro por exemplo)
    return next(req);
};