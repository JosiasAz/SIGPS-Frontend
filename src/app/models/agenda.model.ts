export interface Agenda {
    id: number;
    especialistaId?: number;
    especialista: string;
    especialidade: string;
    data?: string;
    horarios: string[];
    vagas: number;
}

export interface Consulta {
    id: number;
    pacienteId?: number;
    pacienteNome?: string;
    especialista: string;
    especialidade: string;
    data: string;
    horario: string;
    local: string;
    instrucoes: string;
    recomendacoes: string;
    status: 'agendada' | 'concluida' | 'cancelada';
}
