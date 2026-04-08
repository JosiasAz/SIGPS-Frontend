import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, switchMap, catchError, delay } from 'rxjs/operators';
import { of, throwError, Observable } from 'rxjs';
import { AuthResponse, User, UserRole } from '../../models/auth.model';
import { AbstractAuthService } from './abstract-auth.service';
import { environment } from '../../env/environment';

const MOCK_USERS: Record<string, User> = {
    'paciente@sigps.com': { id: 1, name: 'Wagner Beta Paciente', email: 'paciente@sigps.com', role: 'paciente' },
    'visualizador@sigps.com': { id: 2, name: 'Olliver Beta Visualizador', email: 'visualizador@sigps.com', role: 'visualizador' },
    'gestor@sigps.com': { id: 3, name: 'Matheus Beta Gestor', email: 'gestor@sigps.com', role: 'gestor' },
    'especialista@sigps.com': { id: 4, name: 'Dr. Alan Beta Especialista', email: 'especialista@sigps.com', role: 'especialista' },
    'admin@sigps.com': { id: 5, name: 'Josias Hacker Supremo Admin Master', email: 'admin@sigps.com', role: 'admin' }
};

@Injectable({
    providedIn: 'root'
})
export class AuthService extends AbstractAuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private readonly AUTH_KEY = 'sigps_auth';
    private readonly USER_KEY = 'sigps_user';
    private apiUrl = environment.apiUrl;

    private tokenState = signal<string | null>(localStorage.getItem(this.AUTH_KEY));
    private userState = signal<User | null>(this.getStoredUser());

    isAuthenticated = computed(() => !!this.tokenState());
    currentUser = computed(() => this.userState());
    userRole = computed(() => this.userState()?.role || null);

    login(credentials: any): Observable<AuthResponse> {
        // MOCK BEHAVIOR PARA APRESENTAÇÃO
        return of(null).pipe(
            delay(800),
            switchMap(() => {
                const email = (credentials.email || '').trim().toLowerCase();
                let user = MOCK_USERS[email];
                
                // Se o email não constar nos mocks oficiais, gera um usuário genérico (paciente)
                if (!user) {
                    user = { id: 999, name: 'Usuário de Teste (' + email + ')', email: email, role: 'paciente' };
                }

                const token = 'mock-jwt-token-for-' + user.id;
                this.setAuth(token);
                this.setUser(user);
                
                return of({ access_token: token, token_type: 'bearer' });
            })
        );
    }

    register(userData: any): Observable<any> {
        // MOCK BEHAVIOR PARA APRESENTAÇÃO
        return of(null).pipe(
            delay(1000),
            tap(() => {
                const newUser: User = { 
                    id: Math.floor(Math.random() * 1000) + 100, 
                    name: userData.nome, 
                    email: userData.email, 
                    role: 'paciente' // Usuário recém-cadastrado cai como paciente
                };
                const token = 'mock-jwt-token-registered';
                this.setAuth(token);
                this.setUser(newUser);
            }),
            switchMap(() => of({ success: true }))
        );
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

    private fetchCurrentUser(): Observable<User> {
        // Se precisar buscar o current user em algum load
        const user = this.getStoredUser();
        if (user) return of(user).pipe(delay(300));
        return throwError(() => new Error('No user found'));
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
}
