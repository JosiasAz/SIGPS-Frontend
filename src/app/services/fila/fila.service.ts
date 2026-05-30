import { Injectable, inject, signal } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { forkJoin } from 'rxjs';

import { AbstractFilaService, PacienteFila, AnaliseFilaIA } from './abstract-fila.service';

import { environment } from '../../env/environment';

import { API_ENDPOINTS } from '../../config/endpoints';

import { AbstractAuthService } from '../auth/abstract-auth.service';



@Injectable({

    providedIn: 'root'

})

export class FilaService extends AbstractFilaService {

    private http = inject(HttpClient);

    private apiUrl = environment.apiUrl;

    private authService = inject(AbstractAuthService);



    fila = signal<PacienteFila[]>([]);

    analiseIA = signal<AnaliseFilaIA | null>(null);

    carregando = signal(false);



    private loadedOrgId: number | null | undefined = undefined;
    private loadedAt = 0;
    private readonly CACHE_TTL_MS = 25_000;

    invalidateCache(): void {
        this.loadedOrgId = undefined;
        this.loadedAt = 0;
    }



    private buildUrl(path: string): string {

        const orgId = this.authService.activeOrganizationId();

        let url = `${this.apiUrl}${path}`;

        if (orgId !== null && orgId !== undefined) {

            url += `${path.includes('?') ? '&' : '?'}organization_id=${orgId}`;

        }

        return url;

    }



    private orgValida(): boolean {

        const orgId = this.authService.activeOrganizationId();

        return orgId !== null && orgId !== undefined && orgId !== 0;

    }



    refreshFila(force = false): void {

        if (!this.orgValida()) {

            this.fila.set([]);

            this.analiseIA.set(null);

            this.carregando.set(false);

            return;

        }

        const orgId = this.authService.activeOrganizationId();
        const fresh = !force && this.loadedOrgId === orgId && this.loadedAt > 0
            && (Date.now() - this.loadedAt) < this.CACHE_TTL_MS;
        if (fresh) {
            return;
        }

        if (this.carregando()) return;



        this.carregando.set(true);

        forkJoin({

            fila: this.http.get<PacienteFila[]>(this.buildUrl(API_ENDPOINTS.FILA.BASE)),

            analise: this.http.get<AnaliseFilaIA>(this.buildUrl(API_ENDPOINTS.FILA.IA_ANALYSIS)),

        }).subscribe({

            next: ({ fila, analise }) => {

                this.fila.set(fila);

                this.analiseIA.set(analise);

                this.loadedOrgId = orgId;
                this.loadedAt = Date.now();

                this.carregando.set(false);

            },

            error: (err) => {

                console.error('Erro ao carregar fila:', err);

                this.carregando.set(false);

            }

        });

    }



    reordenarFila(): void {
        this.refreshFila(true);
    }



    analisarIA(): void {

        if (!this.orgValida()) return;

        this.http.get<AnaliseFilaIA>(this.buildUrl(API_ENDPOINTS.FILA.IA_ANALYSIS)).subscribe({

            next: (data) => this.analiseIA.set(data),

            error: (err) => console.error('Erro na análise de IA:', err)

        });

    }



    atenderPaciente(id: string, _pacienteNome?: string): void {

        this.http.patch(`${this.apiUrl}${API_ENDPOINTS.FILA.BASE}/${id}/status`, { status: 'Em Atendimento' }).subscribe({

            next: () => this.refreshFila(true),

            error: (err) => console.error('Erro ao atender paciente:', err)

        });

    }



    finalizarAtendimento(id: string): void {

        this.http.patch(`${this.apiUrl}${API_ENDPOINTS.FILA.BASE}/${id}/status`, { status: 'Finalizado' }).subscribe({

            next: () => this.refreshFila(true),

            error: (err) => console.error('Erro ao finalizar atendimento:', err)

        });

    }



    adicionarNaFila(_paciente: Partial<PacienteFila>): void {

        const orgId = this.authService.activeOrganizationId();

        this.http.post(`${this.apiUrl}${API_ENDPOINTS.FILA.ATENDER}`, { organization_id: orgId }).subscribe({

            next: () => this.refreshFila(true),

            error: (err) => console.error('Erro ao adicionar na fila:', err)

        });

    }

}


