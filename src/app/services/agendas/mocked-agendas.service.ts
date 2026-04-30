import { Injectable, signal, computed } from '@angular/core';
import { AbstractAgendasService, Agenda, Consulta } from './abstract-agendas.service';

@Injectable({
    providedIn: 'root'
})
export class MockedAgendasService extends AbstractAgendasService {
    agendas = signal<Agenda[]>([
        { id: 1, especialista: 'Dr. Roberto Lins', especialidade: 'Cardiologia', horarios: ['08:00', '09:00', '10:00'], vagas: 3 },
        { id: 2, especialista: 'Dra. Amanda Silva', especialidade: 'Dermatologia', horarios: ['14:00', '15:00', '16:00'], vagas: 2 },
        { id: 3, especialista: 'Dr. Carlos Mendes', especialidade: 'Pediatria', horarios: ['10:00', '11:00'], vagas: 1 },
    ]);

    consultas = signal<Consulta[]>([
        {
            id: 101,
            especialista: 'Dr. Roberto Lins',
            especialidade: 'Cardiologia',
            data: '15/04/2026',
            horario: '14:30',
            local: 'Unidade Central SIGPS - Sala 302',
            instrucoes: 'Chegar com 15 minutos de antecedência. Não ingerir cafeína 4 horas antes do exame.',
            recomendacoes: 'Trazer exames anteriores e lista de medicamentos em uso.',
            status: 'agendada'
        },
        {
            id: 102,
            especialista: 'Dra. Amanda Silva',
            especialidade: 'Dermatologia',
            data: '18/04/2026',
            horario: '10:00',
            local: 'Anexo Clínico - Sala 12',
            instrucoes: 'Sessão inicial de triagem.',
            recomendacoes: 'Documento de identificação com foto.',
            status: 'agendada'
        }
    ]);

    getProximaConsulta() {
        // Retorna a consulta mais próxima no tempo (mock simplificado)
        const scheduled = this.consultas().filter(c => c.status === 'agendada');
        return scheduled.length > 0 ? scheduled[0] : null;
    }

    excluirAgenda(id: number): void {
        this.agendas.update(prev => prev.filter(a => a.id !== id));
    }

    adicionarAgenda(agenda: Omit<Agenda, 'id'>): void {
        const novaAgenda: Agenda = {
            id: Math.floor(Math.random() * 1000) + 10,
            ...agenda
        } as Agenda;
        this.agendas.update(prev => [...prev, novaAgenda]);
    }

    atualizarAgenda(id: number, agenda: Partial<Agenda>): void {
        this.agendas.update(prev => prev.map(a => a.id === id ? { ...a, ...agenda } : a));
    }

    agendarConsulta(agendaId: number, horario: string): void {
        const agenda = this.agendas().find(a => a.id === agendaId);
        if (agenda) {
            const novaConsulta: Consulta = {
                id: Math.floor(Math.random() * 1000) + 200,
                especialista: agenda.especialista,
                especialidade: agenda.especialidade,
                data: '15/04/2026', // Data fixa para o mock
                horario: horario,
                local: 'Unidade Central SIGPS - Ala B',
                instrucoes: 'Chegue 15 minutos antes.',
                recomendacoes: 'Beba bastante água.',
                status: 'agendada'
            };
            this.consultas.update(prev => [...prev, novaConsulta]);
            
            // Reduz vagas da agenda
            this.agendas.update(prev => prev.map(a => a.id === agendaId ? { ...a, vagas: a.vagas - 1 } : a));
        }
    }

    cancelarConsulta(id: number): void {
        this.consultas.update(prev => prev.filter(c => c.id !== id));
    }
}
