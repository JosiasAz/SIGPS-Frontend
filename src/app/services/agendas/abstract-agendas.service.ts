import { Signal } from '@angular/core';
import { Agenda, Consulta } from '../../models/agenda.model';
export type { Agenda, Consulta };

export abstract class AbstractAgendasService {
    abstract agendas: Signal<Agenda[]>;
    abstract consultas: Signal<Consulta[]>;
    abstract getProximaConsulta(): Consulta | null;
    abstract excluirAgenda(id: number): void;
    abstract adicionarAgenda(agenda: Omit<Agenda, 'id'>): void;
    abstract atualizarAgenda(id: number, agenda: Partial<Agenda>): void;
    abstract agendarConsulta(agendaId: number, horario: string, paciente?: { id: number, nome: string }): void;
    abstract cancelarConsulta(id: number): void;
    abstract atualizarStatusConsulta(id: number, status: string): void;
}
