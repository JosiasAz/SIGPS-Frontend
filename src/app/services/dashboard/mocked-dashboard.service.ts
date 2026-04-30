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
        { name: 'Dr. Roberto Lins', consultations: 45, max: 50, color: '#4f46e5' },
        { name: 'Dra. Amanda Silva', consultations: 38, max: 50, color: '#ec4899' },
        { name: 'Dr. Carlos Mendes', consultations: 25, max: 50, color: '#10b981' },
        { name: 'Dra. Juliana Costa', consultations: 40, max: 50, color: '#f59e0b' },
    ]);
}
