import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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
    page?: number;
    perPage?: number;
    paginate?: boolean;
}

export interface EspecialistasPageResponse {
    items: Profissional[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
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
    currentPage = signal(1);
    perPage = signal(15);
    totalEspecialistas = signal(0);
    totalPages = signal(1);
    isLoadingList = signal(false);
    paginated = signal(false);
    private loadedKey = '';
    private lastFiltros: BuscaProfissionaisFiltros = {};

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

    private buildParams(filtros: BuscaProfissionaisFiltros): HttpParams {
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
        if (filtros.paginate) {
            params = params
                .set('page', String(filtros.page ?? this.currentPage()))
                .set('per_page', String(filtros.perPage ?? this.perPage()));
        }
        return params;
    }

    private applyResponse(data: Profissional[] | EspecialistasPageResponse, paginate: boolean): void {
        if (paginate && !Array.isArray(data)) {
            this.especialistas.set(data.items);
            this.currentPage.set(data.page);
            this.perPage.set(data.per_page);
            this.totalEspecialistas.set(data.total);
            this.totalPages.set(data.total_pages);
            return;
        }
        const items = Array.isArray(data) ? data : data.items;
        this.especialistas.set(items);
        if (paginate) {
            this.totalEspecialistas.set(items.length);
            this.totalPages.set(1);
            this.currentPage.set(1);
        }
    }

    loadEspecialistas(filtros: BuscaProfissionaisFiltros = {}, force = false, onComplete?: () => void): void {
        const paginate = filtros.paginate === true;
        if (paginate) {
            this.paginated.set(true);
            this.lastFiltros = { ...filtros, paginate: true };
            if (filtros.page) this.currentPage.set(filtros.page);
            if (filtros.perPage) this.perPage.set(filtros.perPage);
        } else {
            this.paginated.set(false);
        }

        const params = this.buildParams(filtros);
        const key = cacheKey(['especialistas', 'list', params.toString()]);

        if (!force && key === this.loadedKey && this.especialistas().length) {
            onComplete?.();
            return;
        }

        const cached = !force ? cacheGet<Profissional[] | EspecialistasPageResponse>(key, { session: true }) : null;
        if (cached) {
            this.applyResponse(cached, paginate);
            this.loadedKey = key;
            onComplete?.();
            this.revalidateList(params, key, paginate);
            return;
        }

        this.isLoadingList.set(true);
        this.http.get<Profissional[] | EspecialistasPageResponse>(`${this.apiUrl}/api/v1/specialists/`, { params }).subscribe({
            next: (data) => {
                this.applyResponse(data, paginate);
                this.loadedKey = key;
                cacheSet(key, data, TTL_MS, { session: true });
            },
            error: (err) => console.error('Erro ao buscar especialistas:', err),
            complete: () => {
                this.isLoadingList.set(false);
                onComplete?.();
            },
        });
    }

    reloadPaginated(page?: number, force = true): void {
        const targetPage = page ?? this.currentPage();
        this.loadEspecialistas(
            {
                ...this.lastFiltros,
                paginate: true,
                page: targetPage,
                perPage: this.perPage(),
            },
            force,
        );
    }

    reloadPaginatedFromStart(force = true): void {
        this.loadEspecialistas(
            {
                ...this.lastFiltros,
                paginate: true,
                page: 1,
                perPage: this.perPage(),
            },
            force,
        );
    }

    private revalidateList(params: HttpParams, key: string, paginate: boolean): void {
        this.http.get<Profissional[] | EspecialistasPageResponse>(`${this.apiUrl}/api/v1/specialists/`, { params }).subscribe({
            next: (data) => {
                this.applyResponse(data, paginate);
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
        const paginate = filtros.paginate === true;
        const params = this.buildParams(filtros);
        return this.http.get<Profissional[] | EspecialistasPageResponse>(`${this.apiUrl}/api/v1/specialists/`, { params }).pipe(
            map((data) => {
                if (paginate && !Array.isArray(data)) {
                    this.applyResponse(data, true);
                    return data.items;
                }
                return Array.isArray(data) ? data : data.items;
            }),
        );
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
