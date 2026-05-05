import { Provider } from '@angular/core';
import { AbstractAuthService } from './abstract-auth.service';
import { MockedAuthService } from './mocked-auth.service';
import { AuthService } from './auth.service';

import { environment } from '../../env/environment';

export const AuthProvider: Provider = {
    provide: AbstractAuthService,
    useClass: AuthService
};

// Aliás para manter compatibilidade com nomes antigos se necessário
export { AbstractAuthService as AuthServiceToken };
