export interface Agenda {
    id: number;
    especialista: string;
    especialidade: string;
    horarios: string[];
    vagas: number;
}

export interface Consulta {
    id: number;
    especialista: string;
    especialidade: string;
    data: string;
    horario: string;
    local: string;
    instrucoes: string;
    recomendacoes: string;
    status: 'agendada' | 'concluida' | 'cancelada';
}
