import { Signal } from '@angular/core';

export abstract class AbstractDashboardService {
    abstract stats: Signal<any[]>;
    abstract recentActivities: Signal<any[]>;
    abstract specialistPerformance: Signal<any[]>;

    // Novas propriedades para o Dashboard Avançado (SIGPS Premium)
    abstract recentPatients: Signal<any[]>;
    abstract waitingQueue: Signal<any>;
    abstract appointmentsChart: Signal<any[]>;
    abstract genderChart: Signal<any[]>;

    abstract loadData(periodo?: string): void;
}
