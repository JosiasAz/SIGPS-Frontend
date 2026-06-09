import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AbstractPacientesService, Paciente } from './abstract-pacientes.service';
import { environment } from '../../env/environment';
import { AbstractAuthService } from '../auth/abstract-auth.service';
import { cacheGet, cacheSet, cacheKey, cacheInvalidate } from '../../utils/api-cache';

const TTL_MS = 5 * 60 * 1000;

export interface PacientesFiltros {
    nome?: string;
    cpf?: string;
    page?: number;
    perPage?: number;
    paginate?: boolean;
}

export interface PacientesPageResponse {
    items: Array<Paciente & { data_nascimento?: string; telefone?: string }>;
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

@Injectable({
    providedIn: 'root'
})
export class PacientesService extends AbstractPacientesService {
    private http = inject(HttpClient);
    private authService = inject(AbstractAuthService);
    private apiUrl = environment.apiUrl;

    pacientes = signal<Paciente[]>([]);
    currentPage = signal(1);
    perPage = signal(15);
    totalPacientes = signal(0);
    totalPages = signal(1);
    isLoadingList = signal(false);
    paginated = signal(false);

    private loadedKey = '';
    private lastFiltros: PacientesFiltros = {};

    invalidateCache(): void {
        this.loadedKey = '';
        cacheInvalidate('patients:');
    }

    private mapPacientes(data: Array<Paciente & { data_nascimento?: string; telefone?: string }>): Paciente[] {
        return data.map(p => ({
            id: p.id,
            nome: p.nome,
            cpf: p.cpf,
            organizacao: p.organizacao ?? '—',
            ultimaConsulta: '—',
            especialidade: '—',
        }));
    }

    private buildParams(filtros: PacientesFiltros): HttpParams {
        let params = new HttpParams();
        const orgId = this.authService.activeOrganizationId();
        if (orgId !== null && orgId !== undefined) {
            params = params.set('organization_id', orgId.toString());
        }
        if (filtros.nome?.trim()) params = params.set('nome', filtros.nome.trim());
        if (filtros.cpf?.trim()) {
            const digits = filtros.cpf.replace(/\D/g, '');
            params = params.set('cpf', digits || filtros.cpf.trim());
        }
        if (filtros.paginate) {
            params = params
                .set('page', String(filtros.page ?? this.currentPage()))
                .set('per_page', String(filtros.perPage ?? this.perPage()));
        }
        return params;
    }

    private applyResponse(
        data: Array<Paciente & { data_nascimento?: string; telefone?: string }> | PacientesPageResponse,
        paginate: boolean,
    ): void {
        if (paginate && !Array.isArray(data)) {
            this.pacientes.set(this.mapPacientes(data.items));
            this.currentPage.set(data.page);
            this.perPage.set(data.per_page);
            this.totalPacientes.set(data.total);
            this.totalPages.set(data.total_pages);
            return;
        }
        const items = Array.isArray(data) ? data : data.items;
        this.pacientes.set(this.mapPacientes(items));
    }

    loadPacientes(filtros: PacientesFiltros = {}, force = false): void {
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
        const key = cacheKey(['patients', params.toString()]);

        if (!force && key === this.loadedKey && this.pacientes().length) {
            return;
        }

        const cached = !force ? cacheGet<Paciente[] | PacientesPageResponse>(key, { session: true }) : null;
        if (cached) {
            this.applyResponse(cached, paginate);
            this.loadedKey = key;
            this.revalidate(params, key, paginate);
            return;
        }

        this.isLoadingList.set(true);
        this.http.get<Array<Paciente & { data_nascimento?: string; telefone?: string }> | PacientesPageResponse>(
            `${this.apiUrl}/api/v1/patients/`,
            { params },
        ).subscribe({
            next: (data) => {
                this.applyResponse(data, paginate);
                this.loadedKey = key;
                cacheSet(key, data, TTL_MS, { session: true });
            },
            error: (err) => console.error('Erro ao buscar pacientes:', err),
            complete: () => this.isLoadingList.set(false),
        });
    }

    reloadPaginated(page?: number, force = true): void {
        this.loadPacientes(
            {
                ...this.lastFiltros,
                paginate: true,
                page: page ?? this.currentPage(),
                perPage: this.perPage(),
            },
            force,
        );
    }

    reloadPaginatedFromStart(force = true): void {
        this.loadPacientes(
            {
                ...this.lastFiltros,
                paginate: true,
                page: 1,
                perPage: this.perPage(),
            },
            force,
        );
    }

    private revalidate(params: HttpParams, key: string, paginate: boolean): void {
        this.http.get<Array<Paciente & { data_nascimento?: string; telefone?: string }> | PacientesPageResponse>(
            `${this.apiUrl}/api/v1/patients/`,
            { params },
        ).subscribe({
            next: (data) => {
                this.applyResponse(data, paginate);
                cacheSet(key, data, TTL_MS, { session: true });
            },
            error: (err) => console.error('Erro ao revalidar pacientes:', err),
        });
    }

    adicionarPaciente(paciente: Omit<Paciente, 'id'>): void {
        this.http.post<Paciente>(`${this.apiUrl}/api/v1/patients/`, paciente).subscribe({
            next: () => {
                this.invalidateCache();
                if (this.paginated()) {
                    this.reloadPaginatedFromStart(true);
                }
            },
            error: (err) => console.error('Erro ao adicionar paciente:', err),
        });
    }

    atualizarPaciente(id: number, paciente: Partial<Paciente>): void {
        this.http.put<Paciente>(`${this.apiUrl}/api/v1/patients/${id}`, paciente).subscribe({
            next: (pacienteAtualizado) => {
                this.pacientes.update(pacientes =>
                    pacientes.map(p => p.id === id ? pacienteAtualizado : p)
                );
                this.invalidateCache();
            },
            error: (err) => console.error('Erro ao atualizar paciente:', err),
        });
    }

    excluirPaciente(id: number): void {
        this.http.delete(`${this.apiUrl}/api/v1/patients/${id}`).subscribe({
            next: () => {
                this.invalidateCache();
                if (this.paginated()) {
                    const remaining = this.totalPacientes() - 1;
                    const lastPage = Math.max(1, Math.ceil(remaining / this.perPage()));
                    const page = this.currentPage() > lastPage ? lastPage : this.currentPage();
                    this.reloadPaginated(page, true);
                } else {
                    this.pacientes.update(pacientes => pacientes.filter(p => p.id !== id));
                }
            },
            error: (err) => console.error('Erro ao excluir paciente:', err),
        });
    }
}
