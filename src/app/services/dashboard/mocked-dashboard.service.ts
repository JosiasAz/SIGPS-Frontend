import { Injectable, signal } from '@angular/core';
import { AbstractDashboardService } from './abstract-dashboard.service';

@Injectable({
    providedIn: 'root'
})
export class MockedDashboardService extends AbstractDashboardService {
    stats = signal([
        { label: 'Total de Pacientes', value: '1,284', change: '+12%', icon: 'users', trend: 'up' },
        { label: 'Consultas Hoje', value: '42', change: '+5%', icon: 'calendar', trend: 'up' },
        { label: 'Fila de Espera', value: '18', change: '-2%', icon: 'list', trend: 'down' },
        { label: 'Satisfação', value: '98%', change: '+1%', icon: 'star', trend: 'up' },
    ]);

    recentActivities = signal([
        { user: 'Maria Oliveira', action: 'agendou consulta', time: '5 min atrás', type: 'new' },
        { user: 'Dr. Ricardo', action: 'finalizou atendimento', time: '15 min atrás', type: 'done' },
        { user: 'João Pedro', action: 'entrou na fila de espera', time: '22 min atrás', type: 'queue' },
        { user: 'Sistema', action: 'atualização de IA concluída', time: '1h atrás', type: 'system' },
    ]);

    specialistPerformance = signal([
        { name: 'Dr. Roberto Lins', consultations: 45, max: 50, color: '#419640' },
        { name: 'Dra. Amanda Silva', consultations: 38, max: 50, color: '#2ecc71' },
        { name: 'Dr. Carlos Mendes', consultations: 25, max: 50, color: '#3498db' },
        { name: 'Dra. Juliana Costa', consultations: 40, max: 50, color: '#f1c40f' },
    ]);

    // Novas propriedades de alta fidelidade
    recentPatients = signal([
        { id: 1, nome: 'Cássio Alves Pinheiro', especialidade: 'Cardiologia', status: 'online', data: '10 min atrás', iniciais: 'CP', foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80' },
        { id: 2, nome: 'Maria Leite dos Santos', especialidade: 'Dermatologia', status: 'offline', data: '25 min atrás', iniciais: 'MS', foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80' },
        { id: 3, nome: 'Diana Prestes Almeida', especialidade: 'Clínico Geral', status: 'online', data: '45 min atrás', iniciais: 'DA', foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&h=80&q=80' },
        { id: 4, nome: 'Nilda Francisca Silva', especialidade: 'Pediatria', status: 'offline', data: '1h atrás', iniciais: 'NS', foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&h=80&q=80' },
        { id: 5, nome: 'Leandro Oliveira Baptista', especialidade: 'Ortopedia', status: 'online', data: '2h atrás', iniciais: 'LB', foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80' }
    ]);

    waitingQueue = signal({
        total: 2,
        tempoMedio: '14 min',
        lista: [
            { nome: 'João Pedro Silva', prioridade: 'Amarelo', tempo: '12 min', iniciais: 'JP' },
            { nome: 'Maria Souza Ramos', prioridade: 'Verde', tempo: '5 min', iniciais: 'MR' }
        ]
    });

    appointmentsChart = signal([
        { mes: 'Dez', total: 250, pct: 52 },
        { mes: 'Jan', total: 310, pct: 64 },
        { mes: 'Fev', total: 280, pct: 58 },
        { mes: 'Mar', total: 390, pct: 81 },
        { mes: 'Abr', total: 420, pct: 87 },
        { mes: 'Mai', total: 480, pct: 100 }
    ]);

    genderChart = signal([
        { nome: 'Feminino', pct: 60, valor: 770, cor: '#ec4899' },
        { nome: 'Masculino', pct: 40, valor: 514, cor: '#3b82f6' }
    ]);

    loadData(periodo?: string): void {
        // Mocked service doesn't require HTTP calls, but complies with abstract method
    }
}
