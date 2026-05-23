import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthResponse, User, UserRole } from '../../models/auth.model';
import { AbstractAuthService } from './abstract-auth.service';
import { AbstractEspecialistasService } from '../especialistas/abstract-especialistas.service';
import { SimulationService, SimulatedUser } from '../simulation/simulation.service';

@Injectable({
    providedIn: 'root'
})
export class MockedAuthService extends AbstractAuthService {
    private router = inject(Router);
    private especialistasService = inject(AbstractEspecialistasService);
    private simulationService = inject(SimulationService);
    private readonly AUTH_KEY = 'sigps_auth';
    private readonly USER_KEY = 'sigps_user';

    private tokenState = signal<string | null>(
        typeof localStorage !== 'undefined' ? localStorage.getItem(this.AUTH_KEY) : null
    );
    private userState = signal<User | null>(this.getStoredUser());

    isAuthenticated = computed(() => !!this.tokenState());
    currentUser = computed(() => this.userState());
    userRole = computed(() => this.userState()?.role || null);

    login(credentials: any) {
        // Tenta encontrar o usuário na base persistente
        let simUser = this.simulationService.usuarios().find(u => u.email.toLowerCase() === credentials.email.toLowerCase());

        // Se não existir, mas tiver o padrão, cria na hora para não quebrar testes rápidos
        if (!simUser) {
            const role = this.determineRole(credentials.email);
            simUser = this.simulationService.adicionarUsuario({
                nome: credentials.email.split('@')[0],
                email: credentials.email,
                role: role,
                senha: credentials.password
            });
        }

        // Verificar se é especialista com conta desabilitada (buscando no service de especialistas)
        if (simUser.role === 'especialista') {
            const especialistas = this.especialistasService.especialistas();
            const encontrado = especialistas.find(e => e.nome.toLowerCase().includes(simUser!.nome.toLowerCase()));

            if (encontrado && encontrado.situacao === 'Inativo') {
                return throwError(() => ({
                    code: 'ACCOUNT_DISABLED',
                    nome: encontrado.nome
                }));
            }
        }

        const mockResponse: AuthResponse = {
            access_token: 'mock-jwt-token',
            token_type: 'bearer'
        };

        const mockUser: User = {
            id: simUser.id,
            name: simUser.nome || 'Paciente Alan',
            email: simUser.email,
            role: simUser.role as UserRole
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

    private setAuth(token: string) {
        this.tokenState.set(token);
        if (typeof localStorage !== 'undefined') localStorage.setItem(this.AUTH_KEY, token);
    }

    private setUser(user: User) {
        this.userState.set(user);
        if (typeof localStorage !== 'undefined') localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    private getStoredUser(): User | null {
        if (typeof localStorage === 'undefined') return null;
        
        const stored = localStorage.getItem(this.USER_KEY);
        if (!stored) return null;
        try {
            const user = JSON.parse(stored);
            // Auto-correção: Se o usuário logado não tiver nome, tenta recuperar do simulador
            if (user && !user.name) {
                const simUser = this.simulationService.usuarios().find(u => u.email === user.email);
                user.name = simUser?.nome || 'Paciente Alan';
                // Salva de volta para corrigir o localStorage definitivamente
                localStorage.setItem(this.USER_KEY, JSON.stringify(user));
            }
            return user;
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
