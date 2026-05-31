import { Injectable, inject, signal } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { AbstractPacientesService, Paciente } from './abstract-pacientes.service';

import { environment } from '../../env/environment';

import { AbstractAuthService } from '../auth/abstract-auth.service';

import { cacheGet, cacheSet, cacheKey, cacheInvalidate } from '../../utils/api-cache';

const TTL_MS = 5 * 60 * 1000;

@Injectable({

    providedIn: 'root'

})

export class PacientesService extends AbstractPacientesService {

    private http = inject(HttpClient);

    private authService = inject(AbstractAuthService);

    private apiUrl = environment.apiUrl;

    pacientes = signal<Paciente[]>([]);

    private loadedOrgId: number | null | undefined = undefined;

    invalidateCache(): void {

        this.loadedOrgId = undefined;

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

    private restoreFromCache(orgId: number | null | undefined): boolean {
        const key = cacheKey(['patients', orgId]);
        const cached = cacheGet<Paciente[]>(key, { session: true });
        if (cached) {
            this.pacientes.set(cached);
            this.loadedOrgId = orgId;
            return true;
        }
        return false;
    }

    private revalidate(orgId: number | null | undefined): void {
        let url = `${this.apiUrl}/api/v1/patients/`;
        if (orgId !== null && orgId !== undefined) {
            url += `?organization_id=${orgId}`;
        }
        this.http.get<Array<Paciente & { data_nascimento?: string; telefone?: string }>>(url).subscribe({
            next: (data) => {
                const mapped = this.mapPacientes(data);
                this.pacientes.set(mapped);
                cacheSet(cacheKey(['patients', orgId]), mapped, TTL_MS, { session: true });
                this.loadedOrgId = orgId;
            },
            error: (err) => console.error('Erro ao revalidar pacientes:', err),
        });
    }

    loadPacientes(filtros: { nome?: string; cpf?: string } = {}, force = false): void {

        const orgId = this.authService.activeOrganizationId();
        const isListagem = !filtros.nome && !filtros.cpf;

        if (
            !force &&
            isListagem &&
            this.loadedOrgId === orgId
        ) return;

        if (!force && isListagem && this.restoreFromCache(orgId)) {
            this.revalidate(orgId);
            return;
        }

        let url = `${this.apiUrl}/api/v1/patients/`;
        const params: string[] = [];

        if (orgId !== null && orgId !== undefined) {
            params.push(`organization_id=${orgId}`);
        }
        if (filtros.nome?.trim()) params.push(`nome=${encodeURIComponent(filtros.nome.trim())}`);
        if (filtros.cpf?.trim()) params.push(`cpf=${encodeURIComponent(filtros.cpf.trim())}`);
        if (params.length) url += `?${params.join('&')}`;

        this.http.get<Array<Paciente & { data_nascimento?: string; telefone?: string }>>(url).subscribe({

            next: (data) => {

                const mapped = this.mapPacientes(data);
                this.pacientes.set(mapped);

                if (isListagem) {
                    cacheSet(cacheKey(['patients', orgId]), mapped, TTL_MS, { session: true });
                    this.loadedOrgId = orgId;
                }

            },

            error: (err) => console.error('Erro ao buscar pacientes:', err)

        });

    }

    adicionarPaciente(paciente: Omit<Paciente, 'id'>): void {

        this.http.post<Paciente>(`${this.apiUrl}/api/v1/patients/`, paciente).subscribe({

            next: (novoPaciente) => {

                this.pacientes.update(pacientes => [...pacientes, novoPaciente]);
                this.invalidateCache();

            },

            error: (err) => console.error('Erro ao adicionar paciente:', err)

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

            error: (err) => console.error('Erro ao atualizar paciente:', err)

        });

    }

    excluirPaciente(id: number): void {

        this.http.delete(`${this.apiUrl}/api/v1/patients/${id}`).subscribe({

            next: () => {

                this.pacientes.update(pacientes => pacientes.filter(p => p.id !== id));
                this.invalidateCache();

            },

            error: (err) => console.error('Erro ao excluir paciente:', err)

        });

    }

}
