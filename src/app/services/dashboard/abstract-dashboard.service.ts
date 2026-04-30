import { Signal } from '@angular/core';

export abstract class AbstractDashboardService {
    abstract stats: Signal<any[]>;
    abstract recentActivities: Signal<any[]>;
    abstract specialistPerformance: Signal<any[]>;
}
