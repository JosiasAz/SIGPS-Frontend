import { Injectable, signal } from '@angular/core';
import { AbstractPacientesService, Paciente } from './abstract-pacientes.service';

@Injectable({
    providedIn: 'root'
})
export class MockedPacientesService extends AbstractPacientesService {
    pacientes = signal<Paciente[]>([
        { id: 1, nome: 'Maria Oliveira', cpf: '000.000.000-01', ultimaConsulta: '12/03/2026', especialidade: 'Psicologia' },
        { id: 2, nome: 'José Silva', cpf: '000.000.000-02', ultimaConsulta: '10/03/2026', especialidade: 'Cardiologia' },
        { id: 3, nome: 'Ana Costa', cpf: '000.000.000-03', ultimaConsulta: '08/03/2026', especialidade: 'Fisioterapia' },
        { id: 4, nome: 'Pedro Santos', cpf: '000.000.000-04', ultimaConsulta: '05/03/2026', especialidade: 'Nutrição' },
        { id: 5, nome: 'Carla Dias', cpf: '000.000.000-05', ultimaConsulta: '01/03/2026', especialidade: 'Psiquiatria' },
    ]);

    adicionarPaciente(paciente: Omit<Paciente, 'id'>): void {
        const novoId = Math.max(...this.pacientes().map(p => p.id)) + 1;
        const novoPaciente: Paciente = { ...paciente, id: novoId };
        this.pacientes.update(pacientes => [...pacientes, novoPaciente]);
    }

    atualizarPaciente(id: number, paciente: Partial<Paciente>): void {
        this.pacientes.update(pacientes =>
            pacientes.map(p => p.id === id ? { ...p, ...paciente } : p)
        );
    }

    excluirPaciente(id: number): void {
        this.pacientes.update(pacientes => pacientes.filter(p => p.id !== id));
    }

    /** Compatível com PacientesService para telas que chamam loadPacientes(). */
    loadPacientes(_filtros?: { nome?: string; cpf?: string }, _force?: boolean): void {}
}
