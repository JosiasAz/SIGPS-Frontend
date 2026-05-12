import { Injectable, signal } from '@angular/core';
import { AbstractEspecialistasService, Profissional } from './abstract-especialistas.service';

@Injectable({
    providedIn: 'root'
})
export class MockedEspecialistasService extends AbstractEspecialistasService {
    especialistas = signal<Profissional[]>([
        { 
            id: 1, nome: 'Dr. Roberto Lins', especialidade: 'Cardiologia', crm: '12345-SP', avaliacao: 4.9, avaliacoesCount: 128, foto: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1000&auto=format&fit=crop', proximaVaga: 'Hoje, 14:00',
            consultasRealizadas: 1842, anosExperiencia: 12, taxaRetorno: 94,
            sobre: 'Especialista em cardiologia esportiva com mais de 12 anos de experiência clínica. Foco no acompanhamento de atletas de alta performance e avaliações rigorosas de risco cardiovascular.',
            formacao: [ { titulo: 'Residência em Cardiologia', instituicao: 'InCor - HC/FMUSP', ano: '2014' }, { titulo: 'Medicina', instituicao: 'Universidade de São Paulo (USP)', ano: '2012' } ],
            servicos: ['Consulta Cardiológica', 'Eletrocardiograma (ECG)', 'Risco Cirúrgico', 'Teste Ergométrico', 'Holter 24h', 'MAPA'],
            avaliacoes: [ { nome: 'Maria S.', nota: 5, texto: 'Médico muito atencioso e competente. Explica tudo com calma.', data: 'Há 2 semanas' } ],
            banner: 'https://images.unsplash.com/photo-1551076805-e1869043e560?q=80&w=2670&auto=format&fit=crop', status: 'online',
            estatisticas: { pacientesHoje: 8, consultasMes: 42, faturamentoMes: 'R$ 18.900', satisfacao: '98%' },
            agendaHoje: [
                { hora: '08:00', paciente: 'Maria Santos', tipo: 'Retorno', status: 'confirmado' },
                { hora: '09:00', paciente: 'Carlos Ribeiro', tipo: 'Primeira Consulta', status: 'confirmado' },
                { hora: '10:30', paciente: 'Ana Paula Costa', tipo: 'ECG', status: 'aguardando' },
                { hora: '14:00', paciente: 'João Silva', tipo: 'Risco Cirúrgico', status: 'confirmado' },
                { hora: '15:30', paciente: 'Fernanda Lima', tipo: 'Retorno', status: 'aguardando' }
            ],
            diasDisponiveis: [
                { agendaId: 101, data: 'Hoje', diasemana: 'Qui', slots: ['14:00', '15:30', '16:00'] },
                { agendaId: 102, data: 'Amanhã', diasemana: 'Sex', slots: ['09:00', '10:00', '14:30', '17:00'] },
                { agendaId: 103, data: '10/04', diasemana: 'Seg', slots: ['08:00', '11:00', '13:00', '15:00'] }
            ]
        },
        { id: 2, nome: 'Dra. Amanda Silva', especialidade: 'Dermatologia', crm: '54321-SP', avaliacao: 4.8, avaliacoesCount: 95, foto: 'https://ui-avatars.com/api/?name=Mariana+Alves&background=419640&color=fff&size=200', proximaVaga: 'Amanhã, 09:00',
            consultasRealizadas: 1842, anosExperiencia: 12, taxaRetorno: 94,
            sobre: 'Especialista em cardiologia esportiva com mais de 12 anos de experiência clínica. Foco no acompanhamento de atletas de alta performance e avaliações rigorosas de risco cardiovascular.',
            formacao: [ { titulo: 'Residência em Cardiologia', instituicao: 'InCor - HC/FMUSP', ano: '2014' }, { titulo: 'Medicina', instituicao: 'Universidade de São Paulo (USP)', ano: '2012' } ],
            servicos: ['Consulta Cardiológica', 'Eletrocardiograma (ECG)', 'Risco Cirúrgico', 'Teste Ergométrico', 'Holter 24h', 'MAPA'],
            avaliacoes: [ { nome: 'Maria S.', nota: 5, texto: 'Médico muito atencioso e competente. Explica tudo com calma.', data: 'Há 2 semanas' } ],
            banner: 'https://images.unsplash.com/photo-1551076805-e1869043e560?q=80&w=2670&auto=format&fit=crop', status: 'online',
            estatisticas: { pacientesHoje: 8, consultasMes: 42, faturamentoMes: 'R$ 18.900', satisfacao: '98%' },
            agendaHoje: [
                { hora: '08:00', paciente: 'Maria Santos', tipo: 'Retorno', status: 'confirmado' },
                { hora: '09:00', paciente: 'Carlos Ribeiro', tipo: 'Primeira Consulta', status: 'confirmado' },
                { hora: '10:30', paciente: 'Ana Paula Costa', tipo: 'ECG', status: 'aguardando' },
                { hora: '14:00', paciente: 'João Silva', tipo: 'Risco Cirúrgico', status: 'confirmado' },
                { hora: '15:30', paciente: 'Fernanda Lima', tipo: 'Retorno', status: 'aguardando' }
            ],
            diasDisponiveis: [
                { agendaId: 201, data: 'Hoje', diasemana: 'Qui', slots: ['14:00', '15:30', '16:00'] },
                { agendaId: 202, data: 'Amanhã', diasemana: 'Sex', slots: ['09:00', '10:00', '14:30', '17:00'] },
                { agendaId: 203, data: '10/04', diasemana: 'Seg', slots: ['08:00', '11:00', '13:00', '15:00'] }
            ]
         },
        { id: 3, nome: 'Dr. Carlos Mendes', especialidade: 'Pediatria', crm: '98765-SP', avaliacao: 5.0, avaliacoesCount: 210, foto: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=1000&auto=format&fit=crop', proximaVaga: 'Dia 12/04, 10:30', status: 'offline' },
        { id: 4, nome: 'Dra. Julia Costa', especialidade: 'Ortopedia', crm: '45678-RJ', avaliacao: 4.7, avaliacoesCount: 84, foto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1000&auto=format&fit=crop', proximaVaga: 'Hoje, 16:30', status: 'online' },
        { id: 5, nome: 'Dr. Fernando Lima', especialidade: 'Neurologia', crm: '33445-MG', avaliacao: 4.9, avaliacoesCount: 156, foto: 'https://ui-avatars.com/api/?name=Fernando+Lima&background=419640&color=fff&size=200', proximaVaga: 'Dia 15/04, 08:00', status: 'online' },
        { id: 6, nome: 'Dra. Mariana Alves', especialidade: 'Psiquiatria', crm: '11223-SP', avaliacao: 4.8, avaliacoesCount: 112, foto: 'https://ui-avatars.com/api/?name=Mariana+Alves&background=419640&color=fff&size=200', proximaVaga: 'Amanhã, 14:00', status: 'online' },
        { id: 7, nome: 'Dr. Thiago Nogueira', especialidade: 'Gastroenterologia', crm: '55667-PR', avaliacao: 4.6, avaliacoesCount: 65, foto: 'https://ui-avatars.com/api/?name=Thiago+Nogueira&background=419640&color=fff&size=200', proximaVaga: 'Hoje, 15:00', status: 'online' },
        { id: 8, nome: 'Dra. Beatriz Santos', especialidade: 'Ginecologia', crm: '88776-SC', avaliacao: 5.0, avaliacoesCount: 300, foto: 'https://ui-avatars.com/api/?name=Beatriz+Santos&background=419640&color=fff&size=200', proximaVaga: 'Dia 18/04, 09:00', status: 'offline' },
        { id: 9, nome: 'Dr. Leandro Pereira', especialidade: 'Urologia', crm: '99887-RS', avaliacao: 4.5, avaliacoesCount: 42, foto: 'https://ui-avatars.com/api/?name=Leandro+Pereira&background=419640&color=fff&size=200', proximaVaga: 'Amanhã, 11:30', status: 'online' },
        { id: 10, nome: 'Dra. Sofia Lima', especialidade: 'Nutrologia', crm: '11224-BA', avaliacao: 4.9, avaliacoesCount: 180, foto: 'https://ui-avatars.com/api/?name=Sofia+Lima&background=419640&color=fff&size=200', proximaVaga: 'Dia 14/04, 10:00', status: 'online' }
    ]);

    getProfissionalById(id: number): Profissional | undefined {
        return this.especialistas().find(p => p.id === id);
    }

    addEspecialista(especialista: Partial<Profissional>): void {
        const novo: Profissional = {
            id: Date.now(),
            nome: especialista.nome || '',
            especialidade: especialista.especialidade || '',
            crm: especialista.crm || '',
            documento: especialista.documento || '',
            situacao: especialista.situacao || 'Ativo',
            last_seen: especialista.last_seen || new Date().toISOString(),
            avaliacao: 5.0,
            avaliacoesCount: 0,
            foto: '',
            proximaVaga: ''
        } as Profissional;
        this.especialistas.update(s => [...s, novo]);
    }

    updateEspecialista(id: number, especialista: Partial<Profissional>): void {
        this.especialistas.update(s => s.map(e => e.id === id ? { ...e, ...especialista } : e));
    }

    removeEspecialista(id: number): void {
        this.especialistas.update(s => s.filter(e => e.id !== id));
    }
}
