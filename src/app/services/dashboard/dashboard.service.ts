import { Injectable, inject, signal } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { AbstractDashboardService } from './abstract-dashboard.service';

import { environment } from '../../env/environment';

import { AbstractAuthService } from '../auth/abstract-auth.service';

import { cacheGet, cacheSet, cacheKey, cacheInvalidate } from '../../utils/api-cache';



const TTL_MS = 10 * 60 * 1000;



@Injectable({

    providedIn: 'root'

})

export class DashboardService extends AbstractDashboardService {

    private http = inject(HttpClient);

    private apiUrl = environment.apiUrl;

    private authService = inject(AbstractAuthService);



    stats = signal<any[]>([]);

    recentActivities = signal<any[]>([]);

    specialistPerformance = signal<any[]>([]);

    recentPatients = signal<any[]>([]);

    waitingQueue = signal<any>({ total: 0, tempoMedio: '0 min', lista: [] });

    appointmentsChart = signal<any[]>([]);

    genderChart = signal<any[]>([]);



    private loadedKey = '';



    invalidateCache(): void {

        this.loadedKey = '';

        cacheInvalidate('dashboard:');

    }



    private applyData(data: any): void {

        if (data.stats) this.stats.set(data.stats);

        if (data.recent_activities) this.recentActivities.set(data.recent_activities);

        if (data.specialist_performance) this.specialistPerformance.set(data.specialist_performance);

        if (data.recent_patients) this.recentPatients.set(data.recent_patients);

        if (data.waiting_queue) this.waitingQueue.set(data.waiting_queue);

        if (data.appointments_chart) this.appointmentsChart.set(data.appointments_chart);

        if (data.gender_chart) this.genderChart.set(data.gender_chart);

    }



    loadData(periodo: string = 'mensal', force = false): void {

        const orgId = this.authService.activeOrganizationId();

        const key = cacheKey(['dashboard', orgId, periodo]);

        const memKey = `${orgId}-${periodo}`;



        if (!force) {

            const cached = cacheGet<any>(key, { session: true });

            if (cached) {

                this.applyData(cached);

                this.loadedKey = memKey;

                this.revalidate(periodo, orgId, key);

                return;

            } else if (this.loadedKey === memKey && this.stats().length > 0) {

                return;

            }

        }



        this.fetchDashboard(periodo, orgId, key, memKey);

    }



    private revalidate(periodo: string, orgId: number | null | undefined, key: string): void {

        this.fetchDashboard(periodo, orgId, key, `${orgId}-${periodo}`, true);

    }



    private fetchDashboard(periodo: string, orgId: number | null | undefined, cacheKeyStr: string, memKey: string, silent = false): void {

        let url = `${this.apiUrl}/api/v1/dashboards/?periodo=${periodo}`;

        if (orgId !== null && orgId !== undefined) {

            url += `&organization_id=${orgId}`;

        }

        this.http.get<any>(url).subscribe({

            next: (data) => {

                this.applyData(data);

                cacheSet(cacheKeyStr, data, TTL_MS, { session: true });

                this.loadedKey = memKey;

            },

            error: (err) => {

                if (!silent) console.error('Erro ao buscar dados do dashboard:', err);

            }

        });

    }

}


