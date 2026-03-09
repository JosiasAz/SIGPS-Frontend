import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractAgendasService, Agenda } from './abstract-agendas.service';
import { environment } from '../../env/environment';

@Injectable({
    providedIn: 'root'
})
export class AgendasService extends AbstractAgendasService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;
    agendas = signal<Agenda[]>([]);

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
}
