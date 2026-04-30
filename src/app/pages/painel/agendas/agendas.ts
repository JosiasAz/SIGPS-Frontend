import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AbstractAgendasService, Agenda, Consulta } from '../../../services/agendas/abstract-agendas.service';
import { AbstractAuthService } from '../../../services/auth/abstract-auth.service';

@Component({
  selector: 'app-agendas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './agendas.html',
  styleUrls: ['../painel.scss', './agendas.scss'],
})
export class AgendasComponent {
  private agendasService = inject(AbstractAgendasService);
  private authService = inject(AbstractAuthService);
  private fb = inject(FormBuilder);
  
  agendas = this.agendasService.agendas;
  consultas = this.agendasService.consultas;
  currentAgenda = signal<Agenda | null>(null);
  selectedConsulta = signal<Consulta | null>(null);
  agendaParaAgendamento = signal<Agenda | null>(null);
  agendaForm: FormGroup;

  // Verifica se o usuário tem permissão para editar (Gestor, Admin ou Especialista)
  isGestor = computed(() => {
    const role = this.authService.userRole();
    return role === 'admin' || role === 'gestor' || role === 'especialista';
  });

  isPaciente = computed(() => this.authService.userRole() === 'paciente');

  constructor() {
    this.agendaForm = this.fb.group({
      especialista: ['', Validators.required],
      especialidade: ['', Validators.required],
      vagas: [0, [Validators.required, Validators.min(0)]],
      horariosRaw: ['', Validators.required]
    });
  }

  formatarHorarioSlot(h: string): string {
    const parts = h.split(':');
    if (parts.length === 2) {
      const hour = parseInt(parts[0], 10);
      const nextHour = (hour + 1).toString().padStart(2, '0');
      return `${h} às ${nextHour}:${parts[1]}`;
    }
    return h;
  }

  verDetalhesConsulta(consulta: Consulta) {
    this.selectedConsulta.set(consulta);
  }

  fecharModalConsulta() {
    this.selectedConsulta.set(null);
  }

  cancelarAgendamento(id: number) {
    if (confirm('Deseja realmente cancelar este agendamento?')) {
      this.agendasService.cancelarConsulta(id);
      this.fecharModalConsulta();
    }
  }

  abrirConfiguracao(agenda: Agenda | null = null) {
    if (!this.isGestor()) {
      return;
    }
    this.currentAgenda.set(agenda);
    if (agenda) {
      this.agendaForm.patchValue({
        especialista: agenda.especialista,
        especialidade: agenda.especialidade,
        vagas: agenda.vagas,
        horariosRaw: agenda.horarios.join(', ')
      });
    } else {
      this.agendaForm.reset({ vagas: 5 });
    }
  }

  fecharModal() {
    this.currentAgenda.set(null);
  }

  excluirAgenda(id: number, event: Event) {
    event.stopPropagation();
    if (!this.isGestor()) return;
    
    if (confirm('Tem certeza que deseja remover esta agenda?')) {
      this.agendasService.excluirAgenda(id);
    }
  }

  salvarAgenda() {
    if (!this.isGestor()) return;
    
    if (this.agendaForm.valid) {
      const formValue = this.agendaForm.value;
      const horarios = formValue.horariosRaw.split(',').map((s: string) => s.trim());
      
      const payload: Partial<Agenda> = {
        especialista: formValue.especialista,
        especialidade: formValue.especialidade,
        vagas: formValue.vagas,
        horarios: horarios
      };

      const agenda = this.currentAgenda();
      if (agenda) {
        this.agendasService.atualizarAgenda(agenda.id, payload);
      } else {
        this.agendasService.adicionarAgenda(payload as Omit<Agenda, 'id'>);
      }
      this.fecharModal();
    }
  }

  solicitarHorario(agenda: Agenda) {
    this.agendaParaAgendamento.set(agenda);
  }

  fecharModalAgendamento() {
    this.agendaParaAgendamento.set(null);
  }

  confirmarAgendamento(horario: string) {
    const agenda = this.agendaParaAgendamento();
    if (agenda) {
      this.agendasService.agendarConsulta(agenda.id, horario);
      this.fecharModalAgendamento();
      // Optional: Give feedback
      alert(`Agendamento confirmado para as ${horario}h com ${agenda.especialista}`);
    }
  }
}
