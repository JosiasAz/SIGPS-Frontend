import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AbstractAgendasService, Agenda, Consulta } from './abstract-agendas.service';
import { environment } from '../../env/environment';
import { AbstractAuthService } from '../auth/abstract-auth.service';
import { cacheGet, cacheSet, cacheKey, cacheInvalidate } from '../../utils/api-cache';

const TTL_MS = 5 * 60 * 1000;

@Injectable({
    providedIn: 'root'
})
export class AgendasService extends AbstractAgendasService {
    private http = inject(HttpClient);
    private authService = inject(AbstractAuthService);
    private apiUrl = environment.apiUrl;
    agendas = signal<Agenda[]>([]);
    consultas = signal<Consulta[]>([]);

    private loadedOrgId: number | null | undefined = undefined;
    private loading = false;

    invalidateCache(): void {
        this.loadedOrgId = undefined;
        cacheInvalidate('agendas:');
    }

    private restoreFromCache(orgId: number | null | undefined): boolean {
        const keyAg = cacheKey(['agendas', orgId]);
        const keyCo = cacheKey(['consultas', orgId]);
        const ag = cacheGet<Agenda[]>(keyAg, { session: true });
        const co = cacheGet<Consulta[]>(keyCo, { session: true });
        if (ag && co) {
            this.agendas.set(ag);
            this.consultas.set(co);
            this.loadedOrgId = orgId;
            return true;
        }
        return false;
    }

    loadAll(force = false): void {
        const orgId = this.authService.activeOrganizationId();
        if (this.loading) return;
        if (!force && this.loadedOrgId === orgId) return;

        if (!force && this.restoreFromCache(orgId)) {
            this.revalidate(orgId);
            return;
        }

        this.loading = true;
        let urlAgendas = `${this.apiUrl}/api/v1/schedules/`;
        let urlConsultas = `${this.apiUrl}/api/v1/schedules/consultas`;
        if (orgId !== null && orgId !== undefined) {
            urlAgendas += `?organization_id=${orgId}`;
            urlConsultas += `?organization_id=${orgId}`;
        }

        let pending = 2;
        const finish = () => {
            pending--;
            if (pending === 0) {
                this.loading = false;
                this.loadedOrgId = orgId;
                cacheSet(cacheKey(['agendas', orgId]), this.agendas(), TTL_MS, { session: true });
                cacheSet(cacheKey(['consultas', orgId]), this.consultas(), TTL_MS, { session: true });
            }
        };

        this.http.get<Agenda[]>(urlAgendas).subscribe({
            next: (data) => this.agendas.set(data),
            error: (err) => console.error('Erro ao buscar agendas:', err),
            complete: finish,
        });
        this.http.get<Consulta[]>(urlConsultas).subscribe({
            next: (data) => this.consultas.set(data),
            error: (err) => console.error('Erro ao buscar consultas:', err),
            complete: finish,
        });
    }

    private revalidate(orgId: number | null | undefined): void {
        let urlAgendas = `${this.apiUrl}/api/v1/schedules/`;
        let urlConsultas = `${this.apiUrl}/api/v1/schedules/consultas`;
        if (orgId !== null && orgId !== undefined) {
            urlAgendas += `?organization_id=${orgId}`;
            urlConsultas += `?organization_id=${orgId}`;
        }
        this.http.get<Agenda[]>(urlAgendas).subscribe({
            next: (data) => {
                this.agendas.set(data);
                cacheSet(cacheKey(['agendas', orgId]), data, TTL_MS, { session: true });
            }
        });
        this.http.get<Consulta[]>(urlConsultas).subscribe({
            next: (data) => {
                this.consultas.set(data);
                cacheSet(cacheKey(['consultas', orgId]), data, TTL_MS, { session: true });
            }
        });
    }

    getProximaConsulta(): Consulta | null {
        const agendadas = this.consultas().filter(c => c.status === 'agendada');
        return agendadas.length > 0 ? agendadas[0] : null;
    }

    buscarHorariosEspecialista(especialistaUserId: number): Observable<Agenda[]> {
        return this.http.get<Agenda[]>(
            `${this.apiUrl}/api/v1/schedules/?especialista_user_id=${especialistaUserId}`
        );
    }

    excluirAgenda(id: number): void {
        this.http.delete(`${this.apiUrl}/api/v1/schedules/${id}/`).subscribe({
            next: () => {
                this.agendas.update(prev => prev.filter(a => a.id !== id));
                this.invalidateCache();
            },
            error: (err) => console.error('Erro ao excluir agenda:', err)
        });
    }

    adicionarAgenda(agenda: Omit<Agenda, 'id'>): Observable<Agenda> {
        const orgId = this.authService.activeOrganizationId();
        if (orgId === null || orgId === undefined) {
            return new Observable<never>(observer =>
                observer.error({ error: { message: 'Selecione uma organização antes de criar a agenda.' } })
            );
        }
        const payload = {
            data: (agenda as any).data || new Date().toISOString().split('T')[0],
            horarios: agenda.horarios,
            especialistaId: (agenda as any).especialistaId,
            organization_id: orgId
        };
        return this.http.post<Agenda>(`${this.apiUrl}/api/v1/schedules/`, payload).pipe(
            tap((created) => {
                this.agendas.update(prev => [...prev, created]);
                this.invalidateCache();
            })
        );
    }

    atualizarAgenda(id: number, agenda: Partial<Agenda>): void {
        const payload: any = { horarios: agenda.horarios };
        if ((agenda as any).data) payload.data = (agenda as any).data;
        this.http.patch<Agenda>(`${this.apiUrl}/api/v1/schedules/${id}/`, payload).subscribe({
            next: (updated) => {
                this.agendas.update(prev => prev.map(a => a.id === id ? updated : a));
                this.invalidateCache();
            },
            error: (err) => console.error('Erro ao atualizar agenda:', err)
        });
    }

    agendarConsulta(agendaId: number, horario: string, _paciente?: { id: number, nome: string }): void {
        this.http.post<Consulta>(`${this.apiUrl}/api/v1/schedules/agendar`, { agendaId, horario }).subscribe({
            next: (nova) => {
                this.consultas.update(prev => [...prev, nova]);
                this.agendas.update(prev => prev.map(a =>
                    a.id === agendaId
                        ? { ...a, horarios: a.horarios.filter(h => h !== horario), vagas: a.vagas - 1 }
                        : a
                ));
                this.invalidateCache();
            },
            error: (err) => console.error('Erro ao agendar consulta:', err)
        });
    }

    cancelarConsulta(id: number): void {
        this.http.patch(`${this.apiUrl}/api/v1/schedules/consultas/${id}/status`, { status: 'Cancelada' }).subscribe({
            next: () => {
                this.consultas.update(prev => prev.map(c =>
                    c.id === id ? { ...c, status: 'cancelada' as Consulta['status'] } : c
                ));
                this.invalidateCache();
            },
            error: (err) => console.error('Erro ao cancelar consulta:', err)
        });
    }

    atualizarStatusConsulta(id: number, status: string): void {
        this.http.patch(`${this.apiUrl}/api/v1/schedules/consultas/${id}/status`, { status }).subscribe({
            next: () => {
                this.consultas.update(prev =>
                    prev.map(c => c.id === id ? { ...c, status: status as Consulta['status'] } : c)
                );
                this.invalidateCache();
            },
            error: (err) => console.error('Erro ao atualizar status:', err)
        });
    }
}
