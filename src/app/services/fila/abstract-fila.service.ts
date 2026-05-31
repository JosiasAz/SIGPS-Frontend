import { Signal } from '@angular/core';

export interface AnaliseFilaIA {
    analise: string;
    nivel: 'critico' | 'alerta' | 'normal';
    pacientes_criticos: number;
    pacientes_alta: number;
    total_na_fila: number;
    em_atendimento: number;
    atualizado_em?: string;
    ml_online?: boolean;
    ml_api_url?: string;
}

export interface PacienteFila {
    id: string;
    posicao: number;
    paciente: string;
    prioridade: 'Extrema' | 'Alta' | 'Normal' | 'Baixa';
    tempoEspera: string;
    chegada?: string;
    especialidade: string;
    especialista?: string | null;
    consultaData?: string | null;
    consultaHorario?: string | null;
    consultaId?: number | null;
    status: 'Aguardando' | 'Em Atendimento' | 'Triagem' | 'Concluído' | 'Finalizado';
    aiReasoning?: string;
    aiScore?: number;
    riskTrend: 'up' | 'down' | 'stable';
}

export abstract class AbstractFilaService {
    abstract fila: Signal<PacienteFila[]>;
    abstract analiseIA: Signal<AnaliseFilaIA | null>;
    abstract carregando: Signal<boolean>;
    abstract refreshFila(force?: boolean): void;
    abstract reordenarFila(): void;
    abstract analisarIA(): void;
    abstract atenderPaciente(id: string, pacienteNome?: string): void;
    abstract finalizarAtendimento(id: string): void;
    abstract adicionarNaFila(paciente: Partial<PacienteFila>): void;
}
