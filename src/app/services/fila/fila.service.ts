import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractFilaService, PacienteFila } from './abstract-fila.service';
import { environment } from '../../env/environment';

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
        this.http.get<PacienteFila[]>(`${this.apiUrl}/fila`).subscribe({
            next: (data) => this.fila.set(data),
            error: () => {
                this.fila.set([
                    { 
                        id: 's1', paciente: 'Carlos Silva', prioridade: 'Alta', tempoEspera: '20 min', especialidade: 'Cardiologia', status: 'Aguardando',
                        aiScore: 85, aiReasoning: 'Histórico de hipertensão com queixa de dor torácica.', riskTrend: 'up', vitals: { bpm: 95, spo2: 95, temp: 36.6 }
                    },
                    { 
                        id: 's2', paciente: 'Bruna Mendes', prioridade: 'Normal', tempoEspera: '40 min', especialidade: 'Pediatria', status: 'Aguardando',
                        aiScore: 30, aiReasoning: 'Consulta de rotina. Sem alterações agudas.', riskTrend: 'stable', vitals: { bpm: 105, spo2: 99, temp: 36.8 }
                    }
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
        this.fila.update(prev => [{ 
            id: 'ia-99',
            paciente: 'Roberto Silva', 
            prioridade: 'Extrema', 
            tempoEspera: '0 min', 
            especialidade: 'Cardiologia', 
            status: 'Aguardando',
            aiScore: 99,
            aiReasoning: 'Detecção de Padrão Isquêmico via monitoramento remoto. Intervenção imediata recomendada.',
            riskTrend: 'up',
            vitals: { bpm: 120, spo2: 89, temp: 36.5 }
        }, ...prev]);
    }

    atenderPaciente(pacienteNome: string): void {
        this.fila.update(prev => prev.map(p => {
            if (p.paciente === pacienteNome) {
                return { ...p, status: 'Em Atendimento' as const, tempoEspera: '--' };
            }
            return p;
        }));
    }

    adicionarNaFila(paciente: Partial<PacienteFila>): void {
        const novo: PacienteFila = {
            id: Date.now().toString(),
            paciente: paciente.paciente || 'Paciente',
            prioridade: paciente.prioridade || 'Normal',
            tempoEspera: '0 min',
            especialidade: paciente.especialidade || '',
            status: 'Aguardando',
            aiScore: 50,
            aiReasoning: 'Paciente agendado via portal. Aguardando triagem inicial.',
            riskTrend: 'stable',
            ...paciente
        };
        this.fila.update(f => [...f, novo]);
    }
}
