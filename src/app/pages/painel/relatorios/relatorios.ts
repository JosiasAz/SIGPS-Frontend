import { Component, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AbstractRelatoriosService } from '../../../services/relatorios/abstract-relatorios.service';
import { RelatoriosService } from '../../../services/relatorios/relatorios.service';
import { exportSigpsReport } from '../../../utils/sigps-report-export';
import { SIGPS_LOGO_SVG } from '../../../utils/sigps-logo';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './relatorios.html',
  styleUrls: ['./relatorios.scss', '../painel.scss'],
})
export class RelatoriosComponent implements OnInit {
  private relatoriosService = inject(AbstractRelatoriosService);
  private sanitizer = inject(DomSanitizer);

  @ViewChild('reportDocument') reportDocument?: ElementRef<HTMLElement>;

  relatorio = this.relatoriosService.relatorio;
  carregando = this.relatoriosService.carregando;
  erro = this.relatoriosService.erro;
  periodoSelecionado = signal<'mensal' | 'anual'>('mensal');
  logoSvg: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(SIGPS_LOGO_SVG);

  maxSerieTotal = computed(() => {
    const serie = this.relatorio()?.agendamentos_serie || [];
    return Math.max(...serie.map((s) => s.total), 1);
  });

  ngOnInit(): void {
    this.relatoriosService.loadResumo(this.periodoSelecionado());
  }

  filtrarPeriodo(periodo: 'mensal' | 'anual'): void {
    this.periodoSelecionado.set(periodo);
    (this.relatoriosService as RelatoriosService).invalidateCache?.();
    this.relatoriosService.loadResumo(periodo);
  }

  exportarPDF(): void {
    const el = this.reportDocument?.nativeElement;
    const meta = this.relatorio()?.meta;
    if (!el || !meta) return;
    exportSigpsReport(el, `SIGPS — Relatório ${meta.organizacao}`);
  }

  barHeightPx(total: number): number {
    const max = this.maxSerieTotal();
    return Math.max(4, Math.round((total / max) * 88));
  }

  statusClass(status: string): string {
    const s = status.toLowerCase();
    if (s.includes('conclu')) return 'status-done';
    if (s.includes('cancel')) return 'status-cancel';
    return 'status-pending';
  }
}
