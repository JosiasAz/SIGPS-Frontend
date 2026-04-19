import { Injectable, signal } from '@angular/core';
import { AbstractFilaService, PacienteFila } from './abstract-fila.service';

@Injectable({
    providedIn: 'root'
})
export class MockedFilaService extends AbstractFilaService {
    fila = signal<PacienteFila[]>([
        { 
            id: '1', paciente: 'Maria Eduarda Costa', prioridade: 'Alta', tempoEspera: '15 min', especialidade: 'Pediatria', status: 'Aguardando',
            aiScore: 88, aiReasoning: 'Início súbito de febre alta (39.5°C) em paciente pediátrico. Risco de convulsão febril.', 
            riskTrend: 'up', vitals: { bpm: 110, spo2: 97, temp: 39.5 }
        },
        { 
            id: '2', paciente: 'João Pedro Santos', prioridade: 'Normal', tempoEspera: '25 min', especialidade: 'Clínico Geral', status: 'Aguardando',
            aiScore: 45, aiReasoning: 'Sintomas gripais leves. Estável sem sinais de desconforto respiratório.', 
            riskTrend: 'stable', vitals: { bpm: 78, spo2: 99, temp: 37.2 }
        },
        { 
            id: '3', paciente: 'Ana Paula Oliveira', prioridade: 'Normal', tempoEspera: '--', especialidade: 'Cardiologia', status: 'Em Atendimento',
            aiScore: 92, aiReasoning: 'Pós-operatório imediato. Monitoramento contínuo de arritmia detectada via sensor.', 
            riskTrend: 'down', vitals: { bpm: 88, spo2: 96, temp: 36.8 }
        },
        { 
            id: '4', paciente: 'Lucas Ferreira', prioridade: 'Baixa', tempoEspera: '45 min', especialidade: 'Dermatologia', status: 'Aguardando',
            aiScore: 20, aiReasoning: 'Reação alérgica cutânea localizada. Sem risco sistêmico identificado.', 
            riskTrend: 'stable', vitals: { bpm: 72, spo2: 99, temp: 36.6 }
        }
    ]);

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
            id: '99',
            paciente: 'Roberto Silva', 
            prioridade: 'Extrema', 
            tempoEspera: '0 min', 
            especialidade: 'Cardiologia', 
            status: 'Aguardando',
            aiScore: 98,
            aiReasoning: 'Anomalia Cardíaca Crítica: Bradicardia severa detectada via wearables integrados. Risco iminente de colapso.',
            riskTrend: 'up',
            vitals: { bpm: 38, spo2: 92, temp: 36.2 }
        });
        this.fila.set(currentFila);
    }

    atenderPaciente(pacienteNome: string): void {
        const currentFila = this.fila().map(p => {
            if (p.paciente === pacienteNome) {
                return { ...p, status: 'Em Atendimento' as const, tempoEspera: '--' };
            }
            return p;
        });
        this.fila.set(currentFila);
    }
}
