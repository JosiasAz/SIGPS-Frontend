import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractFilaService } from './abstract-fila.service';
import { environment } from '../../env/environment';

@Injectable({
    providedIn: 'root'
})
export class FilaService extends AbstractFilaService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;
    fila = signal<any[]>([]);

    constructor() {
        super();
        this.loadFila();
    }

    private loadFila() {
        this.http.get<any[]>(`${this.apiUrl}/fila`).subscribe({
            next: (data) => this.fila.set(data),
            error: () => {
                // Caso a API não responda, cria fila mockada temporária para não travar a apresentação
                this.fila.set([
                    { paciente: 'Carlos Silva', prioridade: 'Alta', tempoEspera: '20 min', especialidade: 'Cardiologia', status: 'Aguardando' },
                    { paciente: 'Bruna Mendes', prioridade: 'Normal', tempoEspera: '40 min', especialidade: 'Pediatria', status: 'Aguardando' }
                ]);
            }
        });
    }

    reordenarFila(): void {
        const priorityScore: Record<string, number> = { 'Extrema': 4, 'Alta': 3, 'Normal': 2, 'Baixa': 1 };
        const novaFila = [...this.fila()].sort((a, b) => {
            if (a.status === 'Em Atendimento' && b.status !== 'Em Atendimento') return -1;
            if (b.status === 'Em Atendimento' && a.status !== 'Em Atendimento') return 1;
            return (priorityScore[b.prioridade] || 0) - (priorityScore[a.prioridade] || 0);
        });
        this.fila.set(novaFila);
    }

    analisarIA(): void {
        const currentFila = [...this.fila()];
        currentFila.unshift({ 
            paciente: 'Roberto Silva (Anomalia Cardíaca identificada por IA)', 
            prioridade: 'Extrema', 
            tempoEspera: '0 min', 
            especialidade: 'Cardiologia', 
            status: 'Aguardando' 
        });
        this.fila.set(currentFila);
    }

    atenderPaciente(pacienteNome: string): void {
        const currentFila = this.fila().map(p => {
            if (p.paciente === pacienteNome) {
                return { ...p, status: 'Em Atendimento', tempoEspera: '--' };
            }
            return p;
        });
        this.fila.set(currentFila);
    }
}
