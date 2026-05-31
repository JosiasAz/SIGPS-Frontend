import { Component, inject, computed, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractFilaService, PacienteFila } from '../../../services/fila/abstract-fila.service';
import { AbstractAuthService } from '../../../services/auth/abstract-auth.service';
import { FilaService } from '../../../services/fila/fila.service';

@Component({
  selector: 'app-fila',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fila.html',
  styleUrls: ['../painel.scss', './fila.scss'],
})
export class FilaComponent implements OnInit {
  private filaService = inject(AbstractFilaService);
  private authService = inject(AbstractAuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  fila = this.filaService.fila;
  analiseIA = this.filaService.analiseIA;
  carregando = this.filaService.carregando;

  orgAtiva = computed(() => this.authService.activeOrganizationId());
  semClinicaSelecionada = computed(() => {
    const org = this.orgAtiva();
    return org === null || org === undefined || org === 0;
  });

  podeAtender = computed(() => {
    const role = this.authService.userRole();
    return role === 'especialista' || role === 'gestor';
  });

  aguardando = computed(() => this.fila().filter(p => p.status === 'Aguardando'));
  emAtendimento = computed(() => this.fila().filter(p => p.status === 'Em Atendimento'));
  criticos = computed(() => this.fila().filter(p => p.prioridade === 'Extrema' || p.prioridade === 'Alta'));

  ngOnInit() {
    if (this.authService.userRole() === 'admin') {
      this.router.navigate(['/painel/dashboard']);
      return;
    }
    if (this.semClinicaSelecionada()) return;

    this.atualizarFilaAutomatica();

    interval(30000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.semClinicaSelecionada()) this.filaService.refreshFila(true);
      });
  }

  atualizarFilaAutomatica() {
    this.filaService.refreshFila();
  }

  reordenar() {
    this.atualizarFilaAutomatica();
  }

  atender(item: PacienteFila) {
    this.filaService.atenderPaciente(item.id, item.paciente);
  }

  finalizar(item: PacienteFila) {
    this.filaService.finalizarAtendimento(item.id);
  }

  prioridadeClass(prioridade: string): string {
    if (prioridade === 'Extrema') return 'prio-extrema';
    if (prioridade === 'Alta') return 'prio-alta';
    if (prioridade === 'Baixa') return 'prio-baixa';
    return 'prio-normal';
  }

  analiseNivelClass(): string {
    const nivel = this.analiseIA()?.nivel;
    if (nivel === 'critico') return 'analise-critico';
    if (nivel === 'alerta') return 'analise-alerta';
    return 'analise-normal';
  }
}
