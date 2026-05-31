import { Injectable, signal, computed, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Router } from '@angular/router';

import { tap, catchError } from 'rxjs/operators';

import { of, throwError, Observable } from 'rxjs';

import { AuthResponse, User, UserRole } from '../../models/auth.model';

import { AbstractAuthService } from './abstract-auth.service';

import { environment } from '../../env/environment';

import { API_ENDPOINTS } from '../../config/endpoints';

import { cacheGet, cacheSet, cacheInvalidate } from '../../utils/api-cache';

import {

    getStoredToken,

    getStoredUser,

    clearAuthData,

    persistAuthData,

    getAuthStorage,

    readActiveOrgId,

    writeActiveOrgId,

    readOrgsCache,

    writeOrgsCache,

    saveRememberPreferences,

} from '../../utils/auth-storage';



const ORGS_TTL_MS = 2 * 60 * 1000;



export interface LoginCredentials {

    email: string;

    password: string;

    rememberMe?: boolean;

}



@Injectable({

    providedIn: 'root'

})

export class AuthService extends AbstractAuthService {

    private http = inject(HttpClient);

    private router = inject(Router);

    private apiUrl = environment.apiUrl;

    private sessionRememberMe = true;



    private tokenState = signal<string | null>(getStoredToken());

    private userState = signal<User | null>(getStoredUser<User>());



    isAuthenticated = computed(() => !!this.tokenState());

    currentUser = computed(() => this.userState());

    userRole = computed(() => this.userState()?.role || null);



    organizationIds = computed(() => this.userState()?.organization_ids || []);

    activeOrganizationId = signal<number | null>(null);

    organizations = signal<any[]>([]);



    constructor() {

        super();

        const initialUser = this.userState();

        if (initialUser) {

            const savedOrg = readActiveOrgId();

            if (initialUser.role === 'admin') {

                this.activeOrganizationId.set(savedOrg ?? 0);

            } else if (savedOrg !== null) {

                this.activeOrganizationId.set(savedOrg);

            }

            const cached = readOrgsCache();

            if (cached) this.organizations.set(cached);

            this.loadOrganizations().subscribe();

        }

    }



    private decodeToken(token: string): any {

        try {

            const parts = token.split('.');

            if (parts.length !== 3) return null;

            const decoded = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));

            return JSON.parse(decoded);

        } catch (e) {

            console.error('Error decoding token', e);

            return null;

        }

    }



    private authStorage(): Storage | null {

        return getAuthStorage();

    }



    loadOrganizations(force = false): Observable<any[]> {

        if (!this.isAuthenticated()) {

            this.organizations.set([]);

            return of([]);

        }



        const cached = !force ? cacheGet<any[]>('auth:organizations') : null;

        if (cached) {

            this.organizations.set(cached);

            return of(cached);

        }



        return this.http.get<any[]>(`${this.apiUrl}/api/v1/organizations/list`).pipe(

            tap(orgs => {

                const list = orgs ?? [];

                const isAdmin = this.userRole() === 'admin';

                cacheSet('auth:organizations', list, ORGS_TTL_MS);

                this.organizations.set(list);

                writeOrgsCache(list, this.authStorage());



                const currentActive = this.activeOrganizationId();



                if (isAdmin) {

                    const saved = readActiveOrgId();

                    if (saved !== null && (saved === 0 || list.some(o => o.id === saved))) {

                        this.activeOrganizationId.set(saved);

                        return;

                    }

                    const next = list.length > 0 ? list[0].id : 0;

                    this.activeOrganizationId.set(next);

                    writeActiveOrgId(next, this.authStorage());

                    return;

                }



                if (list.length > 0) {

                    const isValid = list.some(o => o.id === currentActive);

                    if (currentActive === null || !isValid) {

                        this.activeOrganizationId.set(list[0].id);

                        writeActiveOrgId(list[0].id, this.authStorage());

                    }

                } else {

                    this.activeOrganizationId.set(isAdmin ? 0 : null);

                    if (isAdmin) writeActiveOrgId(0, this.authStorage());

                }

            }),

            catchError(err => {

                console.error('Error loading organizations:', err);

                return of([]);

            })

        );

    }



    login(credentials: LoginCredentials): Observable<AuthResponse> {

        this.sessionRememberMe = credentials.rememberMe !== false;

        saveRememberPreferences(this.sessionRememberMe, credentials.email);



        return this.http.post<any>(`${this.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`, {

            email: credentials.email,

            senha: credentials.password,

        }).pipe(

            tap(response => {

                this.setAuth(response.token);

                const tokenPayload = this.decodeToken(response.token);

                if (response.user) {

                    const mappedUser: User = {

                        id: response.user.id,

                        name: response.user.nome || response.user.name,

                        email: response.user.email,

                        role: (response.user.perfil || response.user.role).toLowerCase() as UserRole,

                        organization_ids: tokenPayload?.organization_ids || []

                    };

                    this.setUser(mappedUser);

                    this.loadOrganizations().subscribe();

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

            catchError(error => {

                console.error('Registration error', error);

                return throwError(() => error);

            })

        );

    }



    logout() {

        cacheInvalidate();

        this.tokenState.set(null);

        this.userState.set(null);

        this.activeOrganizationId.set(null);

        clearAuthData();

        this.router.navigate(['/login']);

    }



    hasRole(roles: UserRole[]): boolean {

        const userRole = this.userRole();

        return !!userRole && roles.includes(userRole);

    }



    updateUserRole(role: UserRole): void {

        const current = this.userState();

        if (current) {

            this.setUser({ ...current, role });

        }

    }



    refreshUserProfile(): Observable<User> {

        return this.fetchCurrentUser();

    }



    updateDisplayName(name: string): void {

        const current = this.userState();

        if (current && name) {

            this.setUser({ ...current, name });

        }

    }



    setActiveOrganization(orgId: number): void {

        const isAdmin = this.userRole() === 'admin';

        const storage = this.authStorage();

        if (isAdmin) {

            if (orgId === 0 || this.organizations().some(o => o.id === orgId)) {

                this.activeOrganizationId.set(orgId);

                writeActiveOrgId(orgId, storage);

            }

            return;

        }

        if (this.organizations().some(o => o.id === orgId)) {

            this.activeOrganizationId.set(orgId);

            writeActiveOrgId(orgId, storage);

        }

    }



    private fetchCurrentUser(): Observable<User> {

        const token = this.tokenState();

        const tokenPayload = token ? this.decodeToken(token) : null;

        return this.http.get<any>(`${this.apiUrl}${API_ENDPOINTS.AUTH.ME}`).pipe(

            tap(user => {

                const mappedUser: User = {

                    id: user.id,

                    name: user.nome || user.name,

                    email: user.email,

                    role: (user.perfil || user.role).toLowerCase() as UserRole,

                    organization_ids: tokenPayload?.organization_ids || []

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
    }

    private setUser(user: User) {
        this.userState.set(user);
        const isAdmin = user.role === 'admin';
        const token = this.tokenState();
        if (!token) return;

        let orgId: number | null = readActiveOrgId();
        if (orgId !== null) {
            const isValid = (isAdmin && orgId === 0) || (user.organization_ids?.includes(orgId));
            if (!isValid) {
                orgId = isAdmin ? 0 : (user.organization_ids?.[0] ?? null);
            }
        } else {
            orgId = isAdmin ? 0 : (user.organization_ids?.[0] ?? null);
        }
        this.activeOrganizationId.set(orgId);

        persistAuthData(token, JSON.stringify(user), this.sessionRememberMe, {
            activeOrg: orgId !== null ? orgId.toString() : undefined,
        });
    }
}

