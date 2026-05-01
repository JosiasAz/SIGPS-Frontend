import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractFilaService, PacienteFila } from './abstract-fila.service';
import { environment } from '../../env/environment';
import { API_ENDPOINTS } from '../../config/endpoints';

@Injectable({
    providedIn: 'root'
})
export class FilaService extends AbstractFilaService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;
    fila = signal<PacienteFila[]>([]);

    constructor() {
        super();
        this.loadFila();
    }

    private loadFila() {
        this.http.get<PacienteFila[]>(`${this.apiUrl}${API_ENDPOINTS.FILA.BASE}`).subscribe({
            next: (data) => this.fila.set(data),
            error: (err) => console.error('Erro ao carregar fila:', err)
        });
    }

    reordenarFila(): void {
        // This could be a backend call if preferred
        const priorityScore: Record<string, number> = { 'Extrema': 4, 'Alta': 3, 'Normal': 2, 'Baixa': 1 };
        const novaFila = [...this.fila()].sort((a, b) => {
            if (a.status === 'Em Atendimento' && b.status !== 'Em Atendimento') return -1;
            if (b.status === 'Em Atendimento' && a.status !== 'Em Atendimento') return 1;
            return (priorityScore[b.prioridade] || 0) - (priorityScore[a.prioridade] || 0);
        });
        this.fila.set(novaFila);
    }

    analisarIA(): void {
        this.http.get<PacienteFila>(`${this.apiUrl}${API_ENDPOINTS.FILA.IA_ANALYSIS}`).subscribe({
            next: (newAnalysis) => {
                this.fila.update(prev => [newAnalysis, ...prev]);
            },
            error: (err) => console.error('Erro na análise de IA:', err)
        });
    }

    atenderPaciente(pacienteNome: string): void {
        this.http.post(`${this.apiUrl}${API_ENDPOINTS.FILA.ATENDER}`, { pacienteNome }).subscribe({
            next: () => {
                this.fila.update(prev => prev.map(p => {
                    if (p.paciente === pacienteNome) {
                        return { ...p, status: 'Em Atendimento' as const, tempoEspera: '--' };
                    }
                    return p;
                }));
            },
            error: (err) => console.error('Erro ao atender paciente:', err)
        });
    }

    adicionarNaFila(paciente: Partial<PacienteFila>): void {
        this.http.post<PacienteFila>(`${this.apiUrl}${API_ENDPOINTS.FILA.BASE}`, paciente).subscribe({
            next: (novo) => {
                this.fila.update(f => [...f, novo]);
            },
            error: (err) => console.error('Erro ao adicionar na fila:', err)
        });
    }
}
