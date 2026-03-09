import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authKey = 'sigps_auth';
    const storedAuth = localStorage.getItem(authKey);

    if (storedAuth) {
        try {
            const authData = JSON.parse(storedAuth);
            const token = authData.token;

            if (token) {
                const authReq = req.clone({
                    setHeaders: {
                        Authorization: `Bearer ${token}`
                    }
                });
                return next(authReq);
            }
        } catch (e) {
            console.error('Error parsing auth data for interceptor', e);
        }
    }

    return next(req);
};
