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

  profissional!: Profissional;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id')) || 1;
      const prof = this.especialistasService.getProfissionalById(id);
      
      this.profissional = prof || this.especialistasService.getProfissionalById(1)!;

      if (this.profissional) {
        if (this.profissional.estatisticas) this.estatisticas.set(this.profissional.estatisticas);
        if (this.profissional.agendaHoje) this.agendaHoje.set(this.profissional.agendaHoje);
        if (this.profissional.diasDisponiveis) this.diasDisponiveis = this.profissional.diasDisponiveis;
      }
    });
  }

  calcularStatusVisao(last_seen?: Date | string | null, statusDefault?: string): string {
    if (!last_seen) {
        return statusDefault === 'online' ? 'Online' : 'Offline';
    }
    const lastSeenTime = new Date(last_seen).getTime();
    const now = new Date().getTime();
    const diffMinutes = (now - lastSeenTime) / (1000 * 60);
    return diffMinutes <= 5 ? 'Online' : 'Offline';
  }

  // Stats for the professional's own dashboard view
  estatisticas = signal({
    pacientesHoje: 0,
    consultasMes: 0,
    faturamentoMes: 'R$ 0',
    satisfacao: '0%'
  });

  agendaHoje = signal<any[]>([]);

  diasDisponiveis: any[] = [];

  selectedSlot = signal<{ dia: string; slot: string } | null>(null);

  selecionarHorario(dia: string, slot: string) {
    this.selectedSlot.set({ dia, slot });
  }

  confirmarAgendamento() {
    const sel = this.selectedSlot();
    if (sel) {
      // Tentar encontrar a agenda do profissional
      const agendas = this.agendasService.agendas();
      const agenda = agendas.find(a => a.especialista === this.profissional.nome);
      
      this.agendasService.agendarConsulta(agenda?.id || 1, sel.slot);
      
      alert(`✅ Agendamento realizado com sucesso!\nSua consulta com ${this.profissional.nome} no dia ${sel.dia} às ${sel.slot} foi registrada.`);
      
      this.selectedSlot.set(null);
      this.router.navigate(['/painel/portal-paciente']);
    }
  }

  cancelarSelecao() {
    this.selectedSlot.set(null);
  }
}
