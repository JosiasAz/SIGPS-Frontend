import { Provider } from '@angular/core';
import { AbstractDashboardService } from './abstract-dashboard.service';
import { MockedDashboardService } from './mocked-dashboard.service';
import { DashboardService } from './dashboard.service';
import { environment } from '../../env/environment';

export const DashboardProvider: Provider = {
    provide: AbstractDashboardService,
    useClass: environment.useMock ? MockedDashboardService : DashboardService
};
