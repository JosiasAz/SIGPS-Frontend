import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { AuthResponse, User, UserRole } from '../../models/auth.model';
import { AbstractAuthService } from './abstract-auth.service';
import { environment } from '../../env/environment';

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

    login(credentials: any) {
        // Preparar o corpo da requisição para o formato OAuth2PasswordRequestForm (form-data)
        const body = new HttpParams()
            .set('username', credentials.email)
            .set('password', credentials.password);

        return this.http.post<AuthResponse>(`${this.apiUrl}/api/v1/auth/login`, body, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).pipe(
            tap(response => {
                this.setAuth(response.access_token);
            }),
            // Após o login com sucesso, buscar os dados do usuário corrente (/me)
            switchMap(response => this.fetchCurrentUser()),
            tap(user => {
                this.setUser(user);
            }),
            // Retornar um objeto compatível com AuthResponse se necessário
            switchMap(user => of({
                access_token: this.tokenState()!,
                token_type: 'bearer'
            }))
        );
    }

    register(userData: any) {
        // Ajustar os campos para o que o backend espera (name em vez de nome)
        const userCreate = {
            email: userData.email,
            password: userData.password,
            name: userData.nome
        };
        return this.http.post<any>(`${this.apiUrl}/api/v1/users/`, userCreate);
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

    private fetchCurrentUser() {
        return this.http.get<User>(`${this.apiUrl}/api/v1/auth/me`);
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
