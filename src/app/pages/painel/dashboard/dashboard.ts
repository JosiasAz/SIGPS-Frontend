import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractDashboardService } from '../../../services/dashboard/abstract-dashboard.service';
import { AbstractAuthService } from '../../../services/auth/abstract-auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['../painel.scss'],
})
export class DashboardComponent {
  private dashboardService = inject(AbstractDashboardService);
  private authService = inject(AbstractAuthService);

  stats = this.dashboardService.stats();
  recentActivities = this.dashboardService.recentActivities();
  userRole = this.authService.userRole;

  headerAction = computed(() => {
    const role = this.userRole();
    if (role === 'admin') return { label: 'Novo Colaborador' };
    if (role === 'gestor') return { label: 'Novo Agendamento' };
    if (role === 'especialista') return { label: 'Nova Prescrição' };
    return null;
  });
}
