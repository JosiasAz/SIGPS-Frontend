import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractDashboardService } from '../../../services/dashboard/abstract-dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['../painel.scss'],
})
export class DashboardComponent {
  private dashboardService = inject(AbstractDashboardService);

  stats = this.dashboardService.stats();
  recentActivities = this.dashboardService.recentActivities();
}
