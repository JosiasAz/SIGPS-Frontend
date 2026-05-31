import { Injectable, signal, inject, effect } from '@angular/core';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AbstractAgendasService, Agenda, Consulta } from './abstract-agendas.service';
import { SimulationService } from '../simulation/simulation.service';

@Injectable({
    providedIn: 'root'
})
export class MockedAgendasService extends AbstractAgendasService {
    private simulationService = inject(SimulationService);

    private initialAgendas: Agenda[] = [
        { id: 1, especialistaId: 1, especialista: 'Dr. Roberto Lins', especialidade: 'Cardiologia', data: '05/06/2026', horarios: ['08:00', '09:00', '10:00'], vagas: 3 },
        { id: 2, especialistaId: 1, especialista: 'Dr. Roberto Lins', especialidade: 'Cardiologia', data: '12/06/2026', horarios: ['14:00', '15:00', '16:00'], vagas: 2 },
        { id: 3, especialistaId: 2, especialista: 'Dra. Amanda Silva', especialidade: 'Dermatologia', data: '08/06/2026', horarios: ['10:00', '11:00'], vagas: 1 },
        { id: 4, especialistaId: 3, especialista: 'Dr. Carlos Mendes', especialidade: 'Pediatria', data: '20/06/2026', horarios: ['09:00', '10:30'], vagas: 2 },
    ];

    private initialConsultas: Consulta[] = [
        { id: 101, especialista: 'Dr. Roberto Lins', especialidade: 'Cardiologia', data: '15/04/2026', horario: '14:30', local: 'Unidade Central SIGPS - Sala 302', instrucoes: 'Chegar com 15 min de antecedência.', recomendacoes: 'Trazer exames.', status: 'agendada' },
        { id: 102, especialista: 'Dra. Amanda Silva', especialidade: 'Dermatologia', data: '18/04/2026', horario: '10:00', local: 'Anexo Clínico - Sala 12', instrucoes: 'Triagem.', recomendacoes: 'ID com foto.', status: 'agendada' }
    ];

    agendas = signal<Agenda[]>(this.simulationService.load('agendas', this.initialAgendas));
    consultas = signal<Consulta[]>(this.simulationService.load('consultas', this.initialConsultas));

    constructor() {
        super();
        // Efeito para salvar automaticamente sempre que os sinais mudarem
        effect(() => {
            this.simulationService.save('agendas', this.agendas());
        });
        effect(() => {
            this.simulationService.save('consultas', this.consultas());
        });
    }

    loadAll(_force?: boolean): void {}

    getProximaConsulta() {
        const scheduled = this.consultas().filter(c => c.status === 'agendada');
        return scheduled.length > 0 ? scheduled[0] : null;
    }

    excluirAgenda(id: number): void {
        this.agendas.update(prev => prev.filter(a => a.id !== id));
    }

    adicionarAgenda(agenda: Omit<Agenda, 'id'>): import('rxjs').Observable<Agenda> {
        const novaAgenda: Agenda = {
            id: Math.floor(Math.random() * 1000) + 10,
            ...agenda
        } as Agenda;
        return of(novaAgenda).pipe(
            tap((created) => this.agendas.update(prev => [...prev, created]))
        );
    }

    atualizarAgenda(id: number, agenda: Partial<Agenda>): void {
        this.agendas.update(prev => prev.map(a => a.id === id ? { ...a, ...agenda } : a));
    }

    agendarConsulta(agendaId: number, horario: string, paciente?: { id: number, nome: string }): void {
        const agenda = this.agendas().find(a => a.id === agendaId);
        if (agenda) {
            const novaConsulta: Consulta = {
                id: Math.floor(Math.random() * 1000) + 200,
                pacienteId: paciente?.id,
                pacienteNome: paciente?.nome || 'Paciente Alan',
                especialista: agenda.especialista,
                especialidade: agenda.especialidade,
                data: '15/04/2026',
                horario: horario,
                local: 'Unidade Central SIGPS - Ala B',
                instrucoes: 'Chegue 15 minutos antes.',
                recomendacoes: 'Beba bastante água.',
                status: 'agendada'
            };
            this.consultas.update(prev => [...prev, novaConsulta]);
            this.agendas.update(prev => prev.map(a => a.id === agendaId ? { ...a, vagas: a.vagas - 1 } : a));
        }
    }

    cancelarConsulta(id: number): void {
        this.consultas.update(consultas => consultas.filter(c => c.id !== id));
    }

    atualizarStatusConsulta(id: number, status: string): void {
        this.consultas.update(consultas =>
            consultas.map(c => c.id === id ? { ...c, status: status as Consulta['status'] } : c)
        );
    }
}
