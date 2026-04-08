import { Signal } from '@angular/core';

export interface Paciente {
    id: number;
    nome: string;
    cpf: string;
    ultimaConsulta: string;
    especialidade: string;
    status: 'active' | 'waiting' | 'critical';
    avatar?: string;
}

export abstract class AbstractPacientesService {
    abstract pacientes: Signal<Paciente[]>;
    abstract adicionarPaciente(paciente: Omit<Paciente, 'id'>): void;
    abstract atualizarPaciente(id: number, paciente: Partial<Paciente>): void;
    abstract excluirPaciente(id: number): void;
}
