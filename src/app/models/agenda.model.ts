export interface SlotHorario {
    hora: string;
    disponivel: boolean;
    agendaId?: number;
}

export interface Agenda {
    id: number;
    especialistaId?: number;
    especialistaUserId?: number;
    especialista: string;
    especialidade: string;
    data?: string;
    horarios: string[];
    slots?: SlotHorario[];
    vagas: number;
}

export interface Consulta {
    id: number;
    pacienteId?: number;
    pacienteNome?: string;
    especialista: string;
    especialistaId?: number;
    especialistaUserId?: number;
    especialidade: string;
    data: string;
    horario: string;
    local: string;
    instrucoes: string;
    recomendacoes: string;
    status: 'agendada' | 'concluida' | 'cancelada';
}
