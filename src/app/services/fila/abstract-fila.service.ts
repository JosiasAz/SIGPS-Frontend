import { Signal } from '@angular/core';

export interface PacienteFila {
    id: string;
    paciente: string;
    prioridade: 'Extrema' | 'Alta' | 'Normal' | 'Baixa';
    tempoEspera: string;
    especialidade: string;
    status: 'Aguardando' | 'Em Atendimento' | 'Triagem' | 'Concluído';
    aiReasoning?: string;
    aiScore?: number;
    riskTrend: 'up' | 'down' | 'stable';
    vitals?: {
        bpm: number;
        spo2: number;
        temp: number;
    }
}

export abstract class AbstractFilaService {
    abstract fila: Signal<PacienteFila[]>;
    abstract reordenarFila(): void;
    abstract analisarIA(): void;
    abstract atenderPaciente(id: string, pacienteNome?: string): void;
    abstract adicionarNaFila(paciente: Partial<PacienteFila>): void;
}
