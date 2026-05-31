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
            id: '1', posicao: 1, paciente: 'Helena Moura', prioridade: 'Extrema', tempoEspera: '8 min',
            chegada: '09:22', especialidade: 'Cardiologia', status: 'Em Atendimento',
            aiScore: 3, aiReasoning: 'Idosa com diabetes e dor torácica. Prioridade máxima.',
            riskTrend: 'up', consultaData: '31/05/2026', consultaHorario: '09:30'
        },
        {
            id: '2', posicao: 2, paciente: 'Maria Eduarda Costa', prioridade: 'Alta', tempoEspera: '15 min',
            chegada: '09:10', especialidade: 'Pediatria', status: 'Aguardando',
            aiScore: 2, aiReasoning: 'Febre alta em criança. Risco elevado.',
            riskTrend: 'up', consultaData: '31/05/2026', consultaHorario: '09:45'
        },
        {
            id: '3', posicao: 3, paciente: 'João Pedro Santos', prioridade: 'Normal', tempoEspera: '25 min',
            chegada: '09:00', especialidade: 'Clínico Geral', status: 'Aguardando',
            aiScore: 1, aiReasoning: 'Sintomas gripais leves. Estável.',
            riskTrend: 'stable', consultaData: '31/05/2026', consultaHorario: '10:00'
        },
        {
            id: '4', posicao: 4, paciente: 'Ana Beatriz Lima', prioridade: 'Alta', tempoEspera: '18 min',
            chegada: '09:05', especialidade: 'Nutrição', status: 'Aguardando',
            aiScore: 2, aiReasoning: 'Hipertensão descompensada.',
            riskTrend: 'stable', consultaData: '31/05/2026', consultaHorario: '10:15'
        },
    ];

    fila = signal<PacienteFila[]>(this.simulationService.load('fila', this.initialFila));
    analiseIA = signal<AnaliseFilaIA | null>(null);
    carregando = signal(false);

    constructor() {
        super();
        this.analisarIA();
        effect(() => {
            this.simulationService.save('fila', this.fila());
        });
    }

    invalidateCache(): void {
        // mock — sem cache persistente além do simulation service
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
        const aguardando = this.fila().filter(p => p.status === 'Aguardando');
        const emAtendimento = this.fila().filter(p => p.status === 'Em Atendimento');
        const criticos = this.fila().filter(p => p.prioridade === 'Extrema' || p.prioridade === 'Alta');
        this.analiseIA.set({
            analise: criticos.length >= 2
                ? 'Fila com demanda elevada: priorize casos de risco cardiovascular e pediátrico.'
                : 'Fluxo estável. Tempo médio de espera dentro do esperado.',
            nivel: criticos.length >= 3 ? 'critico' : criticos.length >= 1 ? 'alerta' : 'normal',
            pacientes_criticos: this.fila().filter(p => p.prioridade === 'Extrema').length,
            pacientes_alta: this.fila().filter(p => p.prioridade === 'Alta').length,
            total_na_fila: aguardando.length,
            em_atendimento: emAtendimento.length,
            atualizado_em: 'agora',
            ml_online: true,
        });
    }

    refreshFila(_force?: boolean): void {
        this.reordenarFila();
        this.analisarIA();
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
