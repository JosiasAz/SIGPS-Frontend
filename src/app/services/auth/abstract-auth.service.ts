import { Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthResponse, User, UserRole } from '../../models/auth.model';

export abstract class AbstractAuthService {
    abstract isAuthenticated: Signal<boolean>;
    abstract currentUser: Signal<User | null>;
    abstract userRole: Signal<UserRole | null>;
    abstract organizationIds: Signal<number[]>;
    abstract activeOrganizationId: Signal<number | null>;
    abstract organizations: Signal<any[]>;

    abstract refreshUserProfile(): Observable<User>;

    abstract login(credentials: any): Observable<AuthResponse>;
    abstract register(userData: any): Observable<any>;
    abstract logout(): void;
    abstract hasRole(roles: UserRole[]): boolean;
    abstract updateUserRole(role: UserRole): void;
    abstract updateDisplayName(name: string): void;
    abstract setActiveOrganization(orgId: number): void;
    abstract loadOrganizations(): Observable<any[]>;
}
