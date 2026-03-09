import { Injectable, signal } from '@angular/core';
import { AbstractAgendasService, Agenda } from './abstract-agendas.service';

@Injectable({
    providedIn: 'root'
})
export class MockedAgendasService extends AbstractAgendasService {
    agendas = signal<Agenda[]>([
        { id: 1, especialista: 'Dr. Anderson Silva', especialidade: 'Cardiologia', horarios: ['08:00', '09:00', '10:00'], vagas: 3 },
        { id: 2, especialista: 'Dra. Luiza Souza', especialidade: 'Psicologia', horarios: ['14:00', '15:00', '16:00'], vagas: 2 },
        { id: 3, especialista: 'Dr. Ricardo Alvez', especialidade: 'Fisioterapia', horarios: ['10:00', '11:00'], vagas: 1 },
    ]);
}
