import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthResponse, User, UserRole } from '../../models/auth.model';
import { AbstractAuthService } from './abstract-auth.service';

@Injectable({
    providedIn: 'root'
})
export class MockedAuthService extends AbstractAuthService {
    private router = inject(Router);
    private readonly AUTH_KEY = 'sigps_auth';
    private readonly USER_KEY = 'sigps_user';

    private tokenState = signal<string | null>(localStorage.getItem(this.AUTH_KEY));
    private userState = signal<User | null>(this.getStoredUser());

    isAuthenticated = computed(() => !!this.tokenState());
    currentUser = computed(() => this.userState());
    userRole = computed(() => this.userState()?.role || null);

    login(credentials: any) {
        const mockResponse: AuthResponse = {
            access_token: 'mock-jwt-token',
            token_type: 'bearer'
        };

        const mockUser: User = {
            id: 1,
            name: credentials.email.split('@')[0],
            email: credentials.email,
            role: this.determineRole(credentials.email)
        };

        return of(mockResponse).pipe(
            tap(response => {
                this.setAuth(response.access_token);
                this.setUser(mockUser);
            })
        );
    }

    register(userData: any) {
        const mockUser: User = {
            id: 2,
            name: userData.nome,
            email: userData.email,
            role: 'paciente'
        };

        return of(mockUser);
    }

    logout() {
        this.tokenState.set(null);
        this.userState.set(null);
        localStorage.removeItem(this.AUTH_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.router.navigate(['/login']);
    }

    hasRole(roles: UserRole[]): boolean {
        const userRole = this.userRole();
        return !!userRole && roles.includes(userRole);
    }

    private setAuth(token: string) {
        this.tokenState.set(token);
        localStorage.setItem(this.AUTH_KEY, token);
    }

    private setUser(user: User) {
        this.userState.set(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    private getStoredUser(): User | null {
        const stored = localStorage.getItem(this.USER_KEY);
        if (!stored) return null;
        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    }

    private determineRole(email: string): UserRole {
        if (email.includes('admin')) return 'admin';
        if (email.includes('dr') || email.includes('doc')) return 'especialista';
        if (email.includes('gestor')) return 'gestor';
        if (email.includes('view')) return 'visualizador';
        return 'paciente';
    }
}
