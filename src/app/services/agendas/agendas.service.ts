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
        this.loadConsultas();
    }

    private loadAgendas() {
        this.http.get<Agenda[]>(`${this.apiUrl}/api/v1/schedules/`).subscribe({
            next: (data) => this.agendas.set(data),
            error: (err) => console.error('Erro ao buscar agendas:', err)
        });
    }

    private loadConsultas() {
        this.http.get<Consulta[]>(`${this.apiUrl}/api/v1/schedules/consultas`).subscribe({
            next: (data) => this.consultas.set(data),
            error: (err) => console.error('Erro ao buscar consultas:', err)
        });
    }

    getProximaConsulta(): Consulta | null {
        const agendadas = this.consultas().filter(c => c.status === 'agendada');
        return agendadas.length > 0 ? agendadas[0] : null;
    }

    excluirAgenda(id: number): void {
        this.http.delete(`${this.apiUrl}/api/v1/schedules/${id}/`).subscribe({
            next: () => this.agendas.update(prev => prev.filter(a => a.id !== id)),
            error: (err) => console.error('Erro ao excluir agenda:', err)
        });
    }

    adicionarAgenda(agenda: Omit<Agenda, 'id'>): void {
        const payload = {
            data: (agenda as any).data || new Date().toISOString().split('T')[0],
            horarios: agenda.horarios,
            especialistaId: (agenda as any).especialistaId
        };
        this.http.post<Agenda>(`${this.apiUrl}/api/v1/schedules/`, payload).subscribe({
            next: (created) => this.agendas.update(prev => [...prev, created]),
            error: (err) => console.error('Erro ao criar agenda:', err)
        });
    }

    atualizarAgenda(id: number, agenda: Partial<Agenda>): void {
        const payload: any = { horarios: agenda.horarios };
        if ((agenda as any).data) payload.data = (agenda as any).data;
        this.http.patch<Agenda>(`${this.apiUrl}/api/v1/schedules/${id}/`, payload).subscribe({
            next: (updated) => this.agendas.update(prev => prev.map(a => a.id === id ? updated : a)),
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
            },
            error: (err) => console.error('Erro ao agendar consulta:', err)
        });
    }

    cancelarConsulta(id: number): void {
        this.http.patch(`${this.apiUrl}/api/v1/schedules/consultas/${id}/status`, { status: 'Cancelada' }).subscribe({
            next: () => this.consultas.update(prev => prev.map(c =>
                c.id === id ? { ...c, status: 'cancelada' as Consulta['status'] } : c
            )),
            error: (err) => console.error('Erro ao cancelar consulta:', err)
        });
    }

    atualizarStatusConsulta(id: number, status: string): void {
        this.http.patch(`${this.apiUrl}/api/v1/schedules/consultas/${id}/status`, { status }).subscribe({
            next: () => this.consultas.update(prev =>
                prev.map(c => c.id === id ? { ...c, status: status as Consulta['status'] } : c)
            ),
            error: (err) => console.error('Erro ao atualizar status:', err)
        });
    }
}
