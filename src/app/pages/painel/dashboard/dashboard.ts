import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractDashboardService } from '../../../services/dashboard/abstract-dashboard.service';
import { AbstractAuthService } from '../../../services/auth/abstract-auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss', '../painel.scss'],
})
export class DashboardComponent {
  private dashboardService = inject(AbstractDashboardService);
  private authService = inject(AbstractAuthService);

  stats = this.dashboardService.stats;
  recentActivities = this.dashboardService.recentActivities;
  specialistPerformance = this.dashboardService.specialistPerformance;
  recentPatients = this.dashboardService.recentPatients;
  waitingQueue = this.dashboardService.waitingQueue;
  appointmentsChart = this.dashboardService.appointmentsChart;
  genderChart = this.dashboardService.genderChart;
  userRole = this.authService.userRole;
  periodoSelecionado = signal<string>('mensal');

  filtrarPeriodo(periodo: string) {
    this.periodoSelecionado.set(periodo);
    this.dashboardService.loadData(periodo);
  }

  isGestorOrAdmin = computed(() => {
    const role = this.userRole();
    return role === 'admin' || role === 'gestor';
  });

  headerAction = computed(() => {
    const role = this.userRole();
    if (role === 'admin') return { label: 'Novo Colaborador' };
    if (role === 'gestor') return { label: 'Novo Agendamento' };
    if (role === 'especialista') return { label: 'Nova Prescrição' };
    return null;
  });

  executeAction(): void {
    const action = this.headerAction();
    if (action) {
      alert(`Ação "${action.label}" será redirecionada na próxima versão (MVP)`);
    }
  }

  verDetalhesIA(): void {
    alert("Redirecionando para detalhes de inteligência artificial da fila...");
  }

  calcularOffsetFila(total: number): number {
    const maxFila = 10; // Capacidade máxima visual do círculo
    const clampedTotal = Math.min(Math.max(total, 0), maxFila);
    return 251.2 - (251.2 * (clampedTotal / maxFila));
  }

  calcularOffsetPizza(index: number): number {
    const list = this.genderChart();
    let accumulatedPct = 0;
    for (let i = 0; i < index; i++) {
      accumulatedPct += list[i].pct;
    }
    // Circunferência de r=30 é 188.5
    // Inicia no topo (+47.1) e gira no sentido horário (-)
    return 47.1 - (accumulatedPct * 1.885);
  }

  obterCargaFila(total: number): string {
    if (total === 0) return 'Vazia';
    if (total <= 3) return 'Baixa';
    if (total <= 7) return 'Moderada';
    return 'Alta';
  }

  obterClasseCarga(total: number): string {
    if (total === 0) return 'text-muted';
    if (total <= 3) return 'text-success';
    if (total <= 7) return 'text-warning';
    return 'text-danger';
  }
}
