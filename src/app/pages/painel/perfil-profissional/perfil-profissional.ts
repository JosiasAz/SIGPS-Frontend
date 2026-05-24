import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { AbstractAuthService } from '../../../services/auth/abstract-auth.service';
import { AbstractEspecialistasService, Profissional } from '../../../services/especialistas/abstract-especialistas.service';
import { AbstractAgendasService } from '../../../services/agendas/abstract-agendas.service';

@Component({
  selector: 'app-perfil-profissional',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './perfil-profissional.html',
  styleUrls: ['./perfil-profissional.scss'],
})
export class PerfilProfissionalComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AbstractAuthService);
  private especialistasService = inject(AbstractEspecialistasService);
  private agendasService = inject(AbstractAgendasService);

  userRole = this.authService.userRole;
  isPaciente = computed(() => this.userRole() === 'paciente');
  isEspecialista = computed(() => this.userRole() === 'especialista');

  profissional = signal<Profissional | null>(null);

  estatisticas = signal({
    pacientesHoje: 0,
    consultasMes: 0,
    faturamentoMes: 'R$ 0',
    satisfacao: '0%'
  });

  agendaHoje = signal<any[]>([]);
  diasDisponiveis = signal<{ agendaId: number, data: string, diasemana: string, slots: string[] }[]>([]);
  selectedSlot = signal<{ agendaId: number, dia: string, slot: string } | null>(null);
  selectedPacienteProntuario = signal<any>(null);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id')) || 0;
      this.carregarProfissional(id);
    });
  }

  private carregarProfissional(id: number) {
    // Tenta carregar pelo serviço real com dados completos (inclui diasDisponiveis do backend)
    const realService = this.especialistasService as any;
    if (typeof realService.getProfissionalByIdFromApi === 'function') {
      realService.getProfissionalByIdFromApi(id).subscribe({
        next: (prof: Profissional) => {
          this.profissional.set(prof);
          this.aplicarDadosProfissional(prof);
        },
        error: () => this.carregarDoSignal(id)
      });
    } else {
      this.carregarDoSignal(id);
    }
  }

  private carregarDoSignal(id: number) {
    const prof = this.especialistasService.getProfissionalById(id)
      || this.especialistasService.getProfissionalById(this.especialistasService.especialistas()[0]?.id || 1);
    if (prof) {
      this.profissional.set(prof);
      this.aplicarDadosProfissional(prof);
    }
  }

  private aplicarDadosProfissional(prof: Profissional) {
    if (prof.estatisticas) this.estatisticas.set(prof.estatisticas);
    if (prof.agendaHoje) this.agendaHoje.set(prof.agendaHoje);

    if (prof.diasDisponiveis && prof.diasDisponiveis.length > 0) {
      this.diasDisponiveis.set(prof.diasDisponiveis as any);
    } else {
      // Fallback: busca agendas do profissional diretamente pelo serviço
      this.carregarDiasDisponiveisViaAgendas(prof.id);
    }
  }

  private carregarDiasDisponiveisViaAgendas(especialistaId: number) {
    const agendas = this.agendasService.agendas();
    const agendaDoEspecialista = agendas.filter(a => (a as any).especialistaId === especialistaId);
    const dias = agendaDoEspecialista
      .filter(a => a.horarios && a.horarios.length > 0 && a.data)
      .map(a => ({
        agendaId: a.id,
        data: a.data as string,
        diasemana: '',
        slots: a.horarios
      }));
    this.diasDisponiveis.set(dias);
  }

  calcularStatusVisao(last_seen?: Date | string | null, statusDefault?: string): string {
    if (!last_seen) return statusDefault === 'online' ? 'Online' : 'Offline';
    const diff = (new Date().getTime() - new Date(last_seen).getTime()) / (1000 * 60);
    return diff <= 5 ? 'Online' : 'Offline';
  }

  selecionarHorario(agendaId: number, dia: string, slot: string) {
    this.selectedSlot.set({ agendaId, dia, slot });
  }

  confirmarAgendamento() {
    const sel = this.selectedSlot();
    const prof = this.profissional();
    if (sel && prof) {
      this.agendasService.agendarConsulta(sel.agendaId, sel.slot);
      alert(`Agendamento realizado!\nConsulta com ${prof.nome} em ${sel.dia} às ${sel.slot} registrada.`);
      this.selectedSlot.set(null);
      this.router.navigate(['/painel/portal-paciente']);
    }
  }

  cancelarSelecao() {
    this.selectedSlot.set(null);
  }

  iniciarChat() {
    const prof = this.profissional();
    if (prof) {
      this.router.navigate(['/painel/chat'], { queryParams: { with: prof.id } });
    }
  }

  abrirProntuario(item: any) {
    this.selectedPacienteProntuario.set(item);
  }

  fecharProntuario() {
    this.selectedPacienteProntuario.set(null);
  }

  enviarRelatorio() {
    const item = this.selectedPacienteProntuario();
    if (item) {
      this.agendaHoje.update(agendas =>
        agendas.map(a => a === item ? { ...a, status: 'concluida' } : a)
      );
    }
    this.fecharProntuario();
    alert('Relatório clínico enviado ao paciente com sucesso!');
  }
}
