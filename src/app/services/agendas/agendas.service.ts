import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractAgendasService, Agenda, Consulta } from './abstract-agendas.service';
import { environment } from '../../env/environment';

@Injectable({
    providedIn: 'root'
})
export class AgendasService extends AbstractAgendasService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;
    agendas = signal<Agenda[]>([]);
    consultas = signal<Consulta[]>([]);

    constructor() {
        super();
        this.loadAgendas();
    }

    private loadAgendas() {
        // No backend real, agendas parecem estar em /appointments (agendamentos) ou /schedules.
        // Vou usar /api/v1/schedules/ como ponto de partida
        this.http.get<Agenda[]>(`${this.apiUrl}/api/v1/schedules/`).subscribe({
            next: (data) => this.agendas.set(data),
            error: (err) => console.error('Erro ao buscar agendas:', err)
        });
    }

    getProximaConsulta(): Consulta | null {
        // Mocked logic for real service until we have the correct endpoint
        return this.consultas().length > 0 ? this.consultas()[0] : null;
    }

    excluirAgenda(id: number): void {
        this.http.delete(`${this.apiUrl}/api/v1/schedules/${id}/`).subscribe({
            next: () => this.agendas.update(prev => prev.filter(a => a.id !== id)),
            error: (err) => console.error('Erro ao excluir agenda:', err)
        });
    }

    adicionarAgenda(agenda: Omit<Agenda, 'id'>): void {
        this.http.post<Agenda>(`${this.apiUrl}/api/v1/schedules/`, agenda).subscribe({
            next: (created) => this.agendas.update(prev => [...prev, created]),
            error: (err) => console.error('Erro ao criar agenda:', err)
        });
    }

    atualizarAgenda(id: number, agenda: Partial<Agenda>): void {
        this.http.patch<Agenda>(`${this.apiUrl}/api/v1/schedules/${id}/`, agenda).subscribe({
            next: (updated) => this.agendas.update(prev => prev.map(a => a.id === id ? updated : a)),
            error: (err) => console.error('Erro ao atualizar agenda:', err)
        });
    }

    agendarConsulta(agendaId: number, horario: string): void {
        // Mocked for now
        console.log('Agendando consulta:', agendaId, horario);
    }

    cancelarConsulta(id: number): void {
        // Mocked for now
        this.consultas.update(prev => prev.filter(c => c.id !== id));
    }
}
