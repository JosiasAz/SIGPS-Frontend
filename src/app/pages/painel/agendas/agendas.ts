import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AbstractAgendasService, Agenda, Consulta } from '../../../services/agendas/abstract-agendas.service';
import { AbstractAuthService } from '../../../services/auth/abstract-auth.service';
import { AbstractFilaService } from '../../../services/fila/abstract-fila.service';
import { AbstractEspecialistasService } from '../../../services/especialistas/abstract-especialistas.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../env/environment';

@Component({
  selector: 'app-agendas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './agendas.html',
  styleUrls: ['../painel.scss', './agendas.scss'],
})
export class AgendasComponent {
  private agendasService = inject(AbstractAgendasService);
  private authService = inject(AbstractAuthService);
  private filaService = inject(AbstractFilaService);
  private especialistasService = inject(AbstractEspecialistasService);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  agendas = this.agendasService.agendas;
  consultas = this.agendasService.consultas;

  // ── Modais de agenda ──────────────────────────────────────────
  currentAgenda = signal<Agenda | null>(null);
  isNovaAgenda = signal(false);
  selectedConsulta = signal<Consulta | null>(null);
  agendaParaAgendamento = signal<Agenda | null>(null);
  selectedPacienteProntuario = signal<Consulta | null>(null);

  agendaForm: FormGroup;
  horariosLista = signal<string[]>([]);
  erroHorarios = signal(false);

  // ── Modal de perfil do especialista ──────────────────────────
  isPerfilModalAberto = signal(false);
  localAtendimento = signal('');
  especialidadeEspecialista = signal('');
  salvandoPerfil = signal(false);
  perfilSalvo = signal(false);

  // ── Roles ─────────────────────────────────────────────────────
  isGestor = computed(() => {
    const role = this.authService.userRole();
    return role === 'admin' || role === 'gestor';
  });
  isPaciente = computed(() => this.authService.userRole() === 'paciente');
  isEspecialista = computed(() => this.authService.userRole() === 'especialista');
  podeConfigurarAgenda = computed(() => this.isGestor() || this.isEspecialista());

  // ── Agendas do próprio especialista ──────────────────────────
  agendasDoEspecialista = computed(() => {
    if (!this.isEspecialista()) return [];
    const user = this.authService.currentUser();
    return this.agendas().filter(a => (a as any).especialistaId === user?.id);
  });

  // ── Consultas separadas por status ───────────────────────────
  consultasAtivas = computed(() =>
    this.consultas().filter(c => c.status !== 'cancelada')
  );

  consultasCanceladas = computed(() =>
    this.consultas().filter(c => c.status === 'cancelada')
  );

  mostrarCanceladas = signal(false);

  constructor() {
    this.agendaForm = this.fb.group({
      data: ['', Validators.required]
    });

    // Pré-carrega os dados de perfil do especialista logado
    this.authService.currentUser() && this.carregarPerfilEspecialista();
  }

  private carregarPerfilEspecialista() {
    const user = this.authService.currentUser();
    if (!user) return;
    const prof = this.especialistasService.getProfissionalById(user.id);
    if (prof) {
      this.localAtendimento.set((prof as any).localAtendimento || '');
      this.especialidadeEspecialista.set(prof.especialidade || '');
    }
    // Busca via API para ter dados atualizados
    this.http.get<any>(`${environment.apiUrl}/api/v1/specialists/${user.id}`).subscribe({
      next: (data) => {
        this.localAtendimento.set(data.localAtendimento || '');
        this.especialidadeEspecialista.set(data.especialidade || '');
      },
      error: () => {}
    });
  }

  // ── Modal de perfil ───────────────────────────────────────────
  abrirPerfilModal() {
    this.isPerfilModalAberto.set(true);
    this.perfilSalvo.set(false);
  }

  fecharPerfilModal() {
    this.isPerfilModalAberto.set(false);
  }

  salvarPerfil() {
    this.salvandoPerfil.set(true);
    const payload: any = {};
    if (this.especialidadeEspecialista()) payload['especialidade'] = this.especialidadeEspecialista();
    if (this.localAtendimento()) payload['local_atendimento'] = this.localAtendimento();

    this.http.patch(`${environment.apiUrl}/api/v1/specialists/me`, payload).subscribe({
      next: () => {
        this.salvandoPerfil.set(false);
        this.perfilSalvo.set(true);
        setTimeout(() => this.fecharPerfilModal(), 1200);
      },
      error: () => {
        this.salvandoPerfil.set(false);
        alert('Erro ao salvar perfil. Tente novamente.');
      }
    });
  }

  // ── Modal de configuração de agenda ──────────────────────────
  adicionarHorario(inputEl: HTMLInputElement) {
    const hora = inputEl.value;
    if (!hora) return;
    if (this.horariosLista().includes(hora)) return;
    this.horariosLista.update(list => [...list, hora].sort());
    this.erroHorarios.set(false);
    const [h, m] = hora.split(':').map(Number);
    const proxH = (h + 1).toString().padStart(2, '0');
    inputEl.value = `${proxH}:${m.toString().padStart(2, '0')}`;
  }

  removerHorario(hora: string) {
    this.horariosLista.update(list => list.filter(h => h !== hora));
  }

  abrirConfiguracao(agenda: Agenda | null = null) {
    if (!this.podeConfigurarAgenda()) return;
    this.isNovaAgenda.set(agenda === null);
    this.currentAgenda.set(agenda);
    this.erroHorarios.set(false);
    if (agenda) {
      this.agendaForm.patchValue({ data: this.converterDataParaInput(agenda.data) });
      this.horariosLista.set([...agenda.horarios].sort());
    } else {
      this.agendaForm.reset();
      this.horariosLista.set([]);
    }
  }

  private converterDataParaInput(data?: string): string {
    if (!data) return '';
    const p = data.split('/');
    return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : data;
  }

  fecharModal() {
    this.currentAgenda.set(null);
    this.isNovaAgenda.set(false);
  }

  salvarAgenda() {
    if (!this.podeConfigurarAgenda()) return;
    if (this.horariosLista().length === 0) { this.erroHorarios.set(true); return; }
    if (!this.agendaForm.valid) { this.agendaForm.markAllAsTouched(); return; }

    const horarios = this.horariosLista();
    const payload: any = { data: this.agendaForm.value.data, horarios, vagas: horarios.length };

    const agenda = this.currentAgenda();
    if (agenda) {
      this.agendasService.atualizarAgenda(agenda.id, payload);
    } else {
      this.agendasService.adicionarAgenda(payload as Omit<Agenda, 'id'>);
    }
    this.fecharModal();
  }

  excluirAgenda(id: number, event: Event) {
    event.stopPropagation();
    if (!this.podeConfigurarAgenda()) return;
    if (confirm('Remover esta agenda e todos os horários?')) {
      this.agendasService.excluirAgenda(id);
    }
  }

  // ── Consultas ──────────────────────────────────────────────────
  formatarHorarioSlot(h: string): string {
    const parts = h.split(':');
    if (parts.length === 2) {
      const hour = parseInt(parts[0], 10);
      return `${h} às ${(hour + 1).toString().padStart(2, '0')}:${parts[1]}`;
    }
    return h;
  }

  verDetalhesConsulta(consulta: Consulta) { this.selectedConsulta.set(consulta); }
  fecharModalConsulta() { this.selectedConsulta.set(null); }

  abrirProntuario(consulta: Consulta) { this.selectedPacienteProntuario.set(consulta); }
  fecharProntuario() { this.selectedPacienteProntuario.set(null); }

  enviarRelatorio() {
    const consulta = this.selectedPacienteProntuario();
    if (consulta) this.agendasService.atualizarStatusConsulta(consulta.id, 'concluida');
    this.fecharProntuario();
    alert('Relatório clínico enviado ao paciente com sucesso!');
  }

  cancelarAgendamento(id: number) {
    if (confirm('Deseja cancelar este agendamento?')) {
      this.agendasService.cancelarConsulta(id);
      this.fecharModalConsulta();
    }
  }

  baixarRelatorioPDF(consulta: Consulta) {
    alert(`Iniciando download do relatório da consulta com ${consulta.especialista}...`);
  }

  solicitarHorario(agenda: Agenda) { this.agendaParaAgendamento.set(agenda); }
  fecharModalAgendamento() { this.agendaParaAgendamento.set(null); }

  confirmarAgendamento(horario: string) {
    const agenda = this.agendaParaAgendamento();
    if (agenda) {
      this.agendasService.agendarConsulta(agenda.id, horario);
      this.filaService.adicionarNaFila({
        paciente: this.authService.currentUser()?.name || '',
        especialidade: agenda.especialidade,
        prioridade: 'Normal',
        status: 'Aguardando',
        aiReasoning: `Agendamento para ${agenda.especialista} às ${horario}h.`
      });
      this.fecharModalAgendamento();
      alert(`Agendamento confirmado para as ${horario}h com ${agenda.especialista}!\nVocê já aparece na fila de espera do profissional.`);
    }
  }
}
