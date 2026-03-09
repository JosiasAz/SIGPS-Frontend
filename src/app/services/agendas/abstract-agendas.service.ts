import { Signal } from '@angular/core';

export interface Agenda {
    id: number;
    especialista: string;
    especialidade: string;
    horarios: string[];
    vagas: number;
}

export abstract class AbstractAgendasService {
    abstract agendas: Signal<Agenda[]>;
}
