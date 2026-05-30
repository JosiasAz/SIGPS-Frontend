import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AbstractEspecialistasService, Profissional } from './abstract-especialistas.service';
import { environment } from '../../env/environment';
import { AbstractAuthService } from '../auth/abstract-auth.service';
import { cacheGet, cacheSet, cacheInvalidate, cacheKey } from '../../utils/api-cache';

const TTL_MS = 3 * 60 * 1000;

export interface BuscaProfissionaisFiltros {
    nome?: string;
    especialidade?: string;
    verificados?: boolean;
    organizationId?: number | null;
}

@Injectable({
    providedIn: 'root'
})
export class EspecialistasService extends AbstractEspecialistasService {
    private http = inject(HttpClient);
    private authService = inject(AbstractAuthService);
    private apiUrl = environment.apiUrl;
    especialistas = signal<Profissional[]>([]);
    especialidadesDisponiveis = signal<string[]>([]);
    private loadedKey = '';

    invalidateCache(): void {
        this.loadedKey = '';
        cacheInvalidate('especialistas:');
    }

    private shouldFilterByOrganization(filtros: BuscaProfissionaisFiltros): number | null | undefined {
        if (filtros.organizationId !== undefined && filtros.organizationId !== null) {
            return filtros.organizationId;
        }
        const role = this.authService.userRole();
        if (role === 'paciente' || role === 'visualizador') {
            return undefined;
        }
        return this.authService.activeOrganizationId();
    }

    loadEspecialistas(filtros: BuscaProfissionaisFiltros = {}, force = false, onComplete?: () => void): void {
        let params = new HttpParams();
        const orgId = this.shouldFilterByOrganization(filtros);
        if (orgId !== null && orgId !== undefined) {
            params = params.set('organization_id', orgId.toString());
        }
        if (filtros.nome?.trim()) params = params.set('nome', filtros.nome.trim());
        if (filtros.especialidade?.trim() && filtros.especialidade !== 'Todas') {
            params = params.set('especialidade', filtros.especialidade.trim());
        }
        if (filtros.verificados === true) params = params.set('verificados', 'true');
        if (filtros.verificados === false) params = params.set('verificados', 'false');

        const key = cacheKey(['especialistas', 'list', params.toString()]);
        if (!force && key === this.loadedKey && this.especialistas().length) {
            onComplete?.();
            return;
        }

        const cached = !force ? cacheGet<Profissional[]>(key, { session: true }) : null;
        if (cached) {
            this.especialistas.set(cached);
            this.loadedKey = key;
            onComplete?.();
            this.revalidateList(params, key);
            return;
        }

        this.http.get<Profissional[]>(`${this.apiUrl}/api/v1/specialists/`, { params }).subscribe({
            next: (data) => {
                this.especialistas.set(data);
                this.loadedKey = key;
                cacheSet(key, data, TTL_MS, { session: true });
            },
            error: (err) => console.error('Erro ao buscar especialistas:', err),
            complete: () => onComplete?.(),
        });
    }

    private revalidateList(params: HttpParams, key: string): void {
        this.http.get<Profissional[]>(`${this.apiUrl}/api/v1/specialists/`, { params }).subscribe({
            next: (data) => {
                this.especialistas.set(data);
                cacheSet(key, data, TTL_MS, { session: true });
            },
            error: (err) => console.error('Erro ao revalidar especialistas:', err),
        });
    }

    loadEspecialidades(force = false): void {
        const key = 'especialistas:especialidades';
        const cached = !force ? cacheGet<string[]>(key, { session: true }) : null;
        if (cached) {
            this.especialidadesDisponiveis.set(['Todas', ...cached]);
            return;
        }
        this.http.get<string[]>(`${this.apiUrl}/api/v1/specialists/especialidades`).subscribe({
            next: (data) => {
                cacheSet(key, data, TTL_MS * 2, { session: true });
                this.especialidadesDisponiveis.set(['Todas', ...data]);
            },
            error: () => this.especialidadesDisponiveis.set(['Todas'])
        });
    }

    buscarProfissionais(filtros: BuscaProfissionaisFiltros): Observable<Profissional[]> {
        let params = new HttpParams();
        const orgId = this.shouldFilterByOrganization(filtros);
        if (orgId !== null && orgId !== undefined) {
            params = params.set('organization_id', orgId.toString());
        }
        if (filtros.nome?.trim()) params = params.set('nome', filtros.nome.trim());
        if (filtros.especialidade?.trim() && filtros.especialidade !== 'Todas') {
            params = params.set('especialidade', filtros.especialidade.trim());
        }
        if (filtros.verificados === true) params = params.set('verificados', 'true');
        return this.http.get<Profissional[]>(`${this.apiUrl}/api/v1/specialists/`, { params });
    }

    getProfissionalById(id: number): Profissional | undefined {
        return this.especialistas().find(p => p.id === id);
    }

    getProfissionalByIdFromApi(id: number) {
        return this.http.get<Profissional>(`${this.apiUrl}/api/v1/specialists/${id}`);
    }

    addEspecialista(_especialista: Partial<Profissional>): void {
        console.warn('Use o fluxo de cadastro de usuário com perfil Especialista.');
    }

    updateEspecialista(id: number, especialista: Partial<Profissional>): void {
        this.http.patch(`${this.apiUrl}/api/v1/specialists/me`, especialista).subscribe({
            next: (res: any) => {
                this.especialistas.update(s => s.map(e => e.id === id ? { ...e, ...res.especialista } : e));
            },
            error: (err) => console.error('Erro ao atualizar especialista:', err)
        });
    }

    removeEspecialista(_id: number): void {
        console.warn('Remoção de especialista deve ser feita via painel administrativo.');
    }
}
