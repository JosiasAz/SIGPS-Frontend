import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractDashboardService } from './abstract-dashboard.service';
import { environment } from '../../env/environment';

@Injectable({
    providedIn: 'root'
})
export class DashboardService extends AbstractDashboardService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    stats = signal<any[]>([]);
    recentActivities = signal<any[]>([]);
    specialistPerformance = signal<any[]>([]);

    // Novas propriedades de alta fidelidade
    recentPatients = signal<any[]>([]);
    waitingQueue = signal<any>({ total: 0, tempoMedio: '0 min', lista: [] });
    appointmentsChart = signal<any[]>([]);
    genderChart = signal<any[]>([]);

    constructor() {
        super();
        this.loadData();
    }

    loadData(periodo: string = 'mensal'): void {
        this.http.get<any>(`${this.apiUrl}/api/v1/dashboards/?periodo=${periodo}`).subscribe({
            next: (data) => {
                if (data.stats) this.stats.set(data.stats);
                if (data.recent_activities) this.recentActivities.set(data.recent_activities);
                if (data.specialist_performance) this.specialistPerformance.set(data.specialist_performance);
                if (data.recent_patients) this.recentPatients.set(data.recent_patients);
                if (data.waiting_queue) this.waitingQueue.set(data.waiting_queue);
                if (data.appointments_chart) this.appointmentsChart.set(data.appointments_chart);
                if (data.gender_chart) this.genderChart.set(data.gender_chart);
            },
            error: (err) => console.error('Erro ao buscar dados do dashboard:', err)
        });
    }
}
