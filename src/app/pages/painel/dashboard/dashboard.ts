import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AbstractDashboardService } from '../../../services/dashboard/abstract-dashboard.service';
import { AbstractAuthService } from '../../../services/auth/abstract-auth.service';
import { DashboardService } from '../../../services/dashboard/dashboard.service';
import { AvatarUrlPipe } from '../../../pipes/avatar-url.pipe';
import { AvatarFallbackDirective } from '../../../directives/avatar-fallback.directive';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AvatarUrlPipe, AvatarFallbackDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss', '../painel.scss'],
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(AbstractDashboardService);
  private authService = inject(AbstractAuthService);
  private router = inject(Router);

  stats = this.dashboardService.stats;
  recentActivities = this.dashboardService.recentActivities;
  specialistPerformance = this.dashboardService.specialistPerformance;
  recentPatients = this.dashboardService.recentPatients;
  waitingQueue = this.dashboardService.waitingQueue;
  appointmentsChart = this.dashboardService.appointmentsChart;
  genderChart = this.dashboardService.genderChart;
  userRole = this.authService.userRole;
  periodoSelecionado = signal<string>('mensal');

  isChartEmpty = computed(() => {
    const chart = this.appointmentsChart();
    if (!chart || chart.length === 0) return true;
    return chart.every(bar => bar.total === 0);
  });

  chartSvgData = computed(() => {
    const chart = this.appointmentsChart();
    if (!chart || chart.length === 0) {
      return { points: [], linePath: '', areaPath: '' };
    }

    const startX = 40;
    const endX = 460;
    const startY = 160;
    const endY = 30;

    const maxVal = Math.max(...chart.map(c => c.total), 4);

    const points = chart.map((pt, i) => {
      const stepX = chart.length > 1 ? (endX - startX) / (chart.length - 1) : 0;
      const x = startX + i * stepX;
      const y = startY - (pt.total / maxVal) * (startY - endY);
      return {
        x,
        y,
        label: pt.semana || pt.dia || pt.mes || `P${i + 1}`,
        total: pt.total
      };
    });

    if (points.length === 0) return { points: [], linePath: '', areaPath: '' };

    // Construção de Curva Spline Suave (Cubic Bezier Spline)
    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
      const cpY2 = p1.y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }

    const areaPath = `${linePath} L ${points[points.length - 1].x} 160 L ${points[0].x} 160 Z`;

    return { points, linePath, areaPath };
  });

  filtrarPeriodo(periodo: string) {
    this.periodoSelecionado.set(periodo);
    (this.dashboardService as DashboardService).invalidateCache();
    this.dashboardService.loadData(periodo);
  }

  ngOnInit() {
    this.dashboardService.loadData(this.periodoSelecionado());
  }

  isGestorOrAdmin = computed(() => {
    const role = this.userRole();
    return role === 'admin' || role === 'gestor';
  });

  isAdmin = computed(() => this.userRole() === 'admin');

  /** Banner de triagem e fila operacional — só clínica (gestor/especialista). */
  mostrarTriagemIA = computed(() => {
    const role = this.userRole();
    return role === 'gestor' || role === 'especialista' || role === 'visualizador';
  });

  headerAction = computed(() => {
    const role = this.userRole();
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
    this.router.navigate(['/painel/fila']);
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
