import { Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthResponse, User, UserRole } from '../../models/auth.model';

export abstract class AbstractAuthService {
    abstract isAuthenticated: Signal<boolean>;
    abstract currentUser: Signal<User | null>;
    abstract userRole: Signal<UserRole | null>;

    abstract login(credentials: any): Observable<AuthResponse>;
    abstract register(userData: any): Observable<any>;
    abstract logout(): void;
    abstract hasRole(roles: UserRole[]): boolean;
}
