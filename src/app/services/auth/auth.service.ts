import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { of, throwError, Observable } from 'rxjs';
import { AuthResponse, User, UserRole } from '../../models/auth.model';
import { AbstractAuthService } from './abstract-auth.service';
import { environment } from '../../env/environment';
import { API_ENDPOINTS } from '../../config/endpoints';

@Injectable({
    providedIn: 'root'
})
export class AuthService extends AbstractAuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private readonly AUTH_KEY = 'sigps_auth';
    private readonly USER_KEY = 'sigps_user';
    private apiUrl = environment.apiUrl;

    private tokenState = signal<string | null>(
        typeof localStorage !== 'undefined' ? localStorage.getItem(this.AUTH_KEY) : null
    );
    private userState = signal<User | null>(this.getStoredUser());

    isAuthenticated = computed(() => !!this.tokenState());
    currentUser = computed(() => this.userState());
    userRole = computed(() => this.userState()?.role || null);

    login(credentials: any): Observable<AuthResponse> {
        return this.http.post<any>(`${this.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`, credentials).pipe(
            tap(response => {
                this.setAuth(response.token);
                if (response.user) {
                    const mappedUser: User = {
                        id: response.user.id,
                        name: response.user.nome || response.user.name,
                        email: response.user.email,
                        role: (response.user.perfil || response.user.role).toLowerCase() as UserRole
                    };
                    this.setUser(mappedUser);
                } else {
                    this.fetchCurrentUser().subscribe();
                }
            }),
            catchError(error => {
                console.error('Login error', error);
                return throwError(() => error);
            })
        );
    }

    register(userData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}${API_ENDPOINTS.AUTH.REGISTER}`, userData).pipe(
            tap(() => {
                // Handle registration success (maybe auto-login)
            }),
            catchError(error => {
                console.error('Registration error', error);
                return throwError(() => error);
            })
        );
    }

    logout() {
        this.tokenState.set(null);
        this.userState.set(null);
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(this.AUTH_KEY);
            localStorage.removeItem(this.USER_KEY);
        }
        this.router.navigate(['/login']);
    }

    hasRole(roles: UserRole[]): boolean {
        const userRole = this.userRole();
        return !!userRole && roles.includes(userRole);
    }

    updateUserRole(role: UserRole): void {
        const current = this.userState();
        if (current) {
            const updated = { ...current, role };
            this.setUser(updated);
        }
    }

    private fetchCurrentUser(): Observable<User> {
        return this.http.get<any>(`${this.apiUrl}${API_ENDPOINTS.AUTH.ME}`).pipe(
            tap(user => {
                const mappedUser: User = {
                    id: user.id,
                    name: user.nome || user.name,
                    email: user.email,
                    role: (user.perfil || user.role).toLowerCase() as UserRole
                };
                this.setUser(mappedUser);
            }),
            catchError(error => {
                console.error('Fetch user error', error);
                return throwError(() => error);
            })
        );
    }

    private setAuth(token: string) {
        this.tokenState.set(token);
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.AUTH_KEY, token);
        }
    }

    private setUser(user: User) {
        this.userState.set(user);
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
    }

    private getStoredUser(): User | null {
        if (typeof localStorage === 'undefined') return null;
        const stored = localStorage.getItem(this.USER_KEY);
        if (!stored) return null;
        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    }
}
