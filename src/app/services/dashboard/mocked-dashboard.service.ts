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
}
