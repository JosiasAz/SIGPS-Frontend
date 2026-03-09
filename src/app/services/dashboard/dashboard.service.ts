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

    constructor() {
        super();
        this.loadData();
    }

    private loadData() {
        // Ajustando para o prefixo /api/v1 do backend real
        this.http.get<any>(`${this.apiUrl}/api/v1/dashboards/`).subscribe(data => {
            // Mapeamento caso os campos do backend real sejam diferentes
            if (data.stats) this.stats.set(data.stats);
            if (data.recent_activities) this.recentActivities.set(data.recent_activities);
        });
    }
}
