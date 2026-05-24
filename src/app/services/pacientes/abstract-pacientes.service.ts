import { Signal } from '@angular/core';
import { Paciente } from '../../models/paciente.model';
export type { Paciente };

export abstract class AbstractPacientesService {
    abstract pacientes: Signal<Paciente[]>;
    abstract adicionarPaciente(paciente: Omit<Paciente, 'id'>): void;
    abstract atualizarPaciente(id: number, paciente: Partial<Paciente>): void;
    abstract excluirPaciente(id: number): void;
}
