import { Injectable, signal, inject, effect } from '@angular/core';
import { AbstractFilaService, PacienteFila } from './abstract-fila.service';
import { SimulationService } from '../simulation/simulation.service';

@Injectable({
    providedIn: 'root'
})
export class MockedFilaService extends AbstractFilaService {
    private simulationService = inject(SimulationService);

    private initialFila: PacienteFila[] = [
        { 
            id: '1', paciente: 'Maria Eduarda Costa', prioridade: 'Alta', tempoEspera: '15 min', especialidade: 'Pediatria', status: 'Aguardando',
            aiScore: 88, aiReasoning: 'Início súbito de febre alta (39.5°C). Risco de convulsão febril.', 
            riskTrend: 'up', vitals: { bpm: 110, spo2: 97, temp: 39.5 }
        },
        { 
            id: '2', paciente: 'João Pedro Santos', prioridade: 'Normal', tempoEspera: '25 min', especialidade: 'Clínico Geral', status: 'Aguardando',
            aiScore: 45, aiReasoning: 'Sintomas gripais leves. Estável.', 
            riskTrend: 'stable', vitals: { bpm: 78, spo2: 99, temp: 37.2 }
        },
        { 
            id: '3', paciente: 'Ana Paula Oliveira', prioridade: 'Normal', tempoEspera: '--', especialidade: 'Cardiologia', status: 'Em Atendimento',
            aiScore: 92, aiReasoning: 'Monitoramento contínuo de arritmia detectada.', 
            riskTrend: 'down', vitals: { bpm: 88, spo2: 96, temp: 36.8 }
        }
    ];

    fila = signal<PacienteFila[]>(this.simulationService.load('fila', this.initialFila));

    constructor() {
        super();
        effect(() => {
            this.simulationService.save('fila', this.fila());
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
            id: '99',
            paciente: 'Roberto Silva', 
            prioridade: 'Extrema', 
            tempoEspera: '0 min', 
            especialidade: 'Cardiologia', 
            status: 'Aguardando',
            aiScore: 98,
            aiReasoning: 'Anomalia Cardíaca Crítica: Bradicardia severa detectada via wearables integrados.',
            riskTrend: 'up',
            vitals: { bpm: 38, spo2: 92, temp: 36.2 }
        });
        this.fila.set(currentFila);
    }

    atenderPaciente(id: string, pacienteNome?: string): void {
        const currentFila = this.fila().map(p => {
            if (p.id === id || p.paciente === pacienteNome) {
                return { ...p, status: 'Em Atendimento' as const, tempoEspera: '--' };
            }
            return p;
        });
        this.fila.set(currentFila);
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
