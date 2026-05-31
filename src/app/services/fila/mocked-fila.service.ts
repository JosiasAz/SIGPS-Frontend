import { Injectable, signal, inject, effect } from '@angular/core';
import { AbstractFilaService, PacienteFila, AnaliseFilaIA } from './abstract-fila.service';
import { SimulationService } from '../simulation/simulation.service';

@Injectable({
    providedIn: 'root'
})
export class MockedFilaService extends AbstractFilaService {
    private simulationService = inject(SimulationService);

    private initialFila: PacienteFila[] = [
        {
            id: '1', posicao: 1, paciente: 'Maria Eduarda Costa', prioridade: 'Alta', tempoEspera: '15 min',
            chegada: '09:10', especialidade: 'Pediatria', status: 'Aguardando',
            aiScore: 2, aiReasoning: 'Início súbito de febre alta. Risco elevado.',
            riskTrend: 'up', consultaData: '30/05/2026', consultaHorario: '09:30'
        },
        {
            id: '2', posicao: 2, paciente: 'João Pedro Santos', prioridade: 'Normal', tempoEspera: '25 min',
            chegada: '09:00', especialidade: 'Clínico Geral', status: 'Aguardando',
            aiScore: 1, aiReasoning: 'Sintomas gripais leves. Estável.',
            riskTrend: 'stable', consultaData: '30/05/2026', consultaHorario: '10:00'
        },
    ];

    fila = signal<PacienteFila[]>(this.simulationService.load('fila', this.initialFila));
    analiseIA = signal<AnaliseFilaIA | null>(null);
    carregando = signal(false);

    constructor() {
        super();
        effect(() => {
            this.simulationService.save('fila', this.fila());
        });
    }

    invalidateCache(): void {
        // mock — sem cache persistente além do simulation service
    }

    refreshFila(): void {
        this.reordenarFila();
    }

    reordenarFila(): void {
        const priorityScore: Record<string, number> = { 'Extrema': 4, 'Alta': 3, 'Normal': 2, 'Baixa': 1 };
        const novaFila = [...this.fila()].sort((a, b) => {
            if (a.status === 'Em Atendimento' && b.status !== 'Em Atendimento') return -1;
            if (b.status === 'Em Atendimento' && a.status !== 'Em Atendimento') return 1;
            return (priorityScore[b.prioridade] || 0) - (priorityScore[a.prioridade] || 0);
        }).map((p, i) => ({ ...p, posicao: i + 1 }));
        this.fila.set(novaFila);
    }

    analisarIA(): void {
        this.analiseIA.set({
            analise: 'Fluxo simulado estável.',
            nivel: 'normal',
            pacientes_criticos: 0,
            pacientes_alta: 1,
            total_na_fila: this.fila().filter(p => p.status === 'Aguardando').length,
            em_atendimento: this.fila().filter(p => p.status === 'Em Atendimento').length,
        });
    }

    atenderPaciente(id: string, pacienteNome?: string): void {
        this.fila.update(prev => prev.map(p => {
            if (p.id === id || p.paciente === pacienteNome) {
                return { ...p, status: 'Em Atendimento' as const, tempoEspera: '--' };
            }
            return p;
        }));
    }

    finalizarAtendimento(id: string): void {
        this.fila.update(prev => prev.filter(p => p.id !== id));
    }

    adicionarNaFila(paciente: Partial<PacienteFila>): void {
        const novo: PacienteFila = {
            id: Date.now().toString(),
            posicao: this.fila().length + 1,
            paciente: paciente.paciente || 'Paciente',
            prioridade: paciente.prioridade || 'Normal',
            tempoEspera: '0 min',
            chegada: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            especialidade: paciente.especialidade || '',
            status: 'Aguardando',
            aiScore: 1,
            aiReasoning: 'Paciente agendado via portal.',
            riskTrend: 'stable',
            ...paciente
        };
        this.fila.update(f => [...f, novo]);
    }
}
