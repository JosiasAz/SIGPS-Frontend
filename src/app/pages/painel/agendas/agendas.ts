import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AbstractAgendasService, Agenda, Consulta } from '../../../services/agendas/abstract-agendas.service';
import { AbstractAuthService } from '../../../services/auth/abstract-auth.service';
import { AbstractFilaService } from '../../../services/fila/abstract-fila.service';

@Component({
  selector: 'app-agendas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './agendas.html',
  styleUrls: ['../painel.scss', './agendas.scss'],
})
export class AgendasComponent {
  private agendasService = inject(AbstractAgendasService);
  private authService = inject(AbstractAuthService);
  private filaService = inject(AbstractFilaService);
  private fb = inject(FormBuilder);
  
  agendas = this.agendasService.agendas;
  consultas = this.agendasService.consultas;
  currentAgenda = signal<Agenda | null>(null);
  selectedConsulta = signal<Consulta | null>(null);
  agendaParaAgendamento = signal<Agenda | null>(null);
  agendaForm: FormGroup;

  // Verifica se o usuário tem permissão para configurar agendas (Gestor, Admin)
  isGestor = computed(() => {
    const role = this.authService.userRole();
    return role === 'admin' || role === 'gestor';
  });

  isPaciente = computed(() => this.authService.userRole() === 'paciente');
  isEspecialista = computed(() => this.authService.userRole() === 'especialista');

  consultasDoEspecialista = computed(() => {
    // Usa o nome do usuário logado para filtrar as consultas
    const user = this.authService.currentUser();
    const nomeLogado = user?.name?.toLowerCase() || '';
    return this.consultas().filter(c => 
      c.especialista.toLowerCase().includes(nomeLogado) ||
      nomeLogado.includes(c.especialista.split(' ')[1]?.toLowerCase() || '_')
    );
  });

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

  // ---- Prontuário Eletrônico do Especialista ----
  selectedPacienteProntuario = signal<Consulta | null>(null);

  abrirProntuario(consulta: Consulta) {
    this.selectedPacienteProntuario.set(consulta);
  }

  fecharProntuario() {
    this.selectedPacienteProntuario.set(null);
  }

  enviarRelatorio() {
    alert('Relatório clínico e arquivo anexado foram enviados ao paciente com sucesso!\nO paciente agora pode visualizar e baixar o PDF em "Meus Agendamentos" no portal dele.');
    
    // Atualiza o status da consulta para "concluida"
    const consulta = this.selectedPacienteProntuario();
    if (consulta) {
      this.agendasService.atualizarStatusConsulta(consulta.id, 'concluida');
    }
    this.fecharProntuario();
  }

  cancelarAgendamento(id: number) {
    if (confirm('Deseja realmente cancelar este agendamento?')) {
      this.agendasService.cancelarConsulta(id);
      this.fecharModalConsulta();
    }
  }

  baixarRelatorioPDF(consulta: Consulta) {
    alert(`Iniciando download do relatório da consulta com ${consulta.especialista}...\n(Isto simula o download de um arquivo PDF gerado pelo sistema)`);
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
      const user = this.authService.currentUser();
      const nomeParaSalvar = user?.name || (user as any)?.nome || 'Alan (Forçado)';
      
      // Diagnóstico temporário
      console.log('Enviando agendamento para:', nomeParaSalvar);

      this.agendasService.agendarConsulta(agenda.id, horario, {
        id: user?.id || 0,
        nome: nomeParaSalvar
      });

      // Adicionar paciente à fila de espera do especialista
      this.filaService.adicionarNaFila({
        paciente: nomeParaSalvar,
        especialidade: agenda.especialidade,
        prioridade: 'Normal',
        status: 'Aguardando',
        aiReasoning: `Agendamento confirmado via portal para ${agenda.especialista} às ${horario}h.`
      });

      this.fecharModalAgendamento();
      alert(`Agendamento confirmado para as ${horario}h com ${agenda.especialista}\nVocê já aparece na fila de espera do profissional!`);
    }
  }
}
