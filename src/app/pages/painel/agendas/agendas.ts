import { Component, inject, signal, computed, viewChild, effect, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AbstractAgendasService, Agenda, Consulta } from '../../../services/agendas/abstract-agendas.service';
import { AgendasService } from '../../../services/agendas/agendas.service';
import { AbstractAuthService } from '../../../services/auth/abstract-auth.service';
import { AbstractEspecialistasService } from '../../../services/especialistas/abstract-especialistas.service';
import { EspecialistasService } from '../../../services/especialistas/especialistas.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../env/environment';
import { PerfilService } from '../../../services/perfil/perfil.service';

@Component({
  selector: 'app-agendas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './agendas.html',
  styleUrls: ['../painel.scss', './agendas.scss'],
})
export class AgendasComponent implements OnInit {
  private agendasService = inject(AbstractAgendasService);
  private authService = inject(AbstractAuthService);
  private especialistasService = inject(AbstractEspecialistasService);
  private http = inject(HttpClient);
  private perfilService = inject(PerfilService);
  private fb = inject(FormBuilder);

  private agendaDialog = viewChild<ElementRef<HTMLDialogElement>>('agendaDialog');

  agendas = this.agendasService.agendas;
  consultas = this.agendasService.consultas;

  // ── Modais ────────────────────────────────────────────────────
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
  isGestorOuAdmin = computed(() => {
    const role = this.authService.userRole();
    return role === 'admin' || role === 'gestor';
  });
  isPaciente = computed(() => this.authService.userRole() === 'paciente');
  isEspecialista = computed(() => this.authService.userRole() === 'especialista');

  temCadastroProfissional = signal(false);
  meuEspecialistaId = signal<number | null>(null);
  modoAgenda = signal<'clinica' | 'minha'>('clinica');

  temVisaoDupla = computed(() => this.isGestorOuAdmin() && this.temCadastroProfissional());

  mostrarVisaoProfissional = computed(() => {
    if (this.isEspecialista()) return true;
    return this.temVisaoDupla() && this.modoAgenda() === 'minha';
  });

  mostrarVisaoClinica = computed(() => {
    if (this.isPaciente() || this.isEspecialista()) return false;
    if (!this.temCadastroProfissional()) return true;
    return this.modoAgenda() === 'clinica';
  });

  podeConfigurarAgenda = computed(() => this.mostrarVisaoProfissional());
  isVisaoSomenteLeitura = computed(() => this.mostrarVisaoClinica());

  meuUserId = computed(() => this.authService.currentUser()?.id ?? 0);

  // ── Admin / Gestor: filtros e agrupamento ─────────────────────
  filtroBusca = signal('');
  filtroEspecialistaId = signal<number | 'todos'>('todos');
  filtroEspecialidade = signal('todas');
  filtroPeriodo = signal<'futuras' | 'passadas' | 'todas'>('futuras');
  gruposExpandidos = signal<Set<number>>(new Set());
  private expansaoInicialAplicada = false;

  private agendasFiltradasGestor = computed(() => {
    const hoje = this.inicioDoDia(new Date());
    const busca = this.filtroBusca().trim().toLowerCase();
    const espId = this.filtroEspecialistaId();
    const espLabel = this.filtroEspecialidade();
    const periodo = this.filtroPeriodo();

    return this.agendas().filter(a => {
      if (espId !== 'todos' && a.especialistaId !== espId) return false;
      if (espLabel !== 'todas' && a.especialidade !== espLabel) return false;
      if (busca) {
        const hay = `${a.especialista} ${a.especialidade} ${a.data}`.toLowerCase();
        if (!hay.includes(busca)) return false;
      }
      if (periodo !== 'todas' && a.data) {
        const d = this.parseDataBr(a.data);
        if (periodo === 'futuras' && d < hoje) return false;
        if (periodo === 'passadas' && d >= hoje) return false;
      }
      return true;
    });
  });

  especialidadesDisponiveis = computed(() => {
    const set = new Set(this.agendas().map(a => a.especialidade).filter(Boolean));
    return ['todas', ...Array.from(set).sort()];
  });

  especialistasParaFiltro = computed(() => {
    const map = new Map<number, { id: number; nome: string; especialidade: string }>();
    for (const a of this.agendas()) {
      if (a.especialistaId != null && !map.has(a.especialistaId)) {
        map.set(a.especialistaId, {
          id: a.especialistaId,
          nome: a.especialista,
          especialidade: a.especialidade,
        });
      }
    }
    return Array.from(map.values()).sort((x, y) => x.nome.localeCompare(y.nome, 'pt-BR'));
  });

  gruposPorEspecialista = computed(() => {
    const porEsp = new Map<number, Agenda[]>();
    for (const a of this.agendasFiltradasGestor()) {
      const id = a.especialistaId ?? 0;
      if (!porEsp.has(id)) porEsp.set(id, []);
      porEsp.get(id)!.push(a);
    }

    const grupos = Array.from(porEsp.entries()).map(([especialistaId, lista]) => {
      const agendas = [...lista].sort(
        (x, y) => this.parseDataBr(x.data || '').getTime() - this.parseDataBr(y.data || '').getTime()
      );
      const primeiro = agendas[0];
      const agendasPorMes = this.agruparAgendasPorMes(agendas);
      return {
        especialistaId,
        especialista: primeiro?.especialista || 'Sem nome',
        especialidade: primeiro?.especialidade || '—',
        totalDias: agendas.length,
        totalVagas: agendas.reduce((s, ag) => s + (ag.vagas || 0), 0),
        agendas,
        agendasPorMes,
      };
    });

    return grupos.sort((a, b) => a.especialista.localeCompare(b.especialista, 'pt-BR'));
  });

  adminResumo = computed(() => {
    const grupos = this.gruposPorEspecialista();
    const lista = this.agendasFiltradasGestor();
    return {
      especialistas: grupos.length,
      dias: lista.length,
      vagas: lista.reduce((s, a) => s + (a.vagas || 0), 0),
    };
  });

  temFiltrosAtivos = computed(() =>
    !!this.filtroBusca().trim() ||
    this.filtroEspecialistaId() !== 'todos' ||
    this.filtroEspecialidade() !== 'todas' ||
    this.filtroPeriodo() !== 'futuras'
  );

  // ── Agendas do especialista (próprias) ───────────────────────
  agendasDoEspecialista = computed(() => {
    if (!this.mostrarVisaoProfissional()) return [];
    const uid = this.meuUserId();
    const espId = this.meuEspecialistaId();
    return this.agendas().filter(a =>
      a.especialistaUserId === uid ||
      (espId != null && a.especialistaId === espId)
    );
  });

  consultasParaCalendario = computed(() => {
    const base = this.consultasAtivas();
    if (this.isEspecialista()) return base;
    if (this.mostrarVisaoProfissional()) {
      const espId = this.meuEspecialistaId();
      if (espId == null) return [];
      return base.filter(c => c.especialistaId === espId);
    }
    return base;
  });

  // ── Consultas separadas por status ───────────────────────────
  consultasAtivas = computed(() =>
    this.consultas().filter(c => c.status !== 'cancelada')
  );
  consultasCanceladas = computed(() =>
    this.consultas().filter(c => c.status === 'cancelada')
  );
  mostrarCanceladas = signal(false);

  // ── Calendário Mensal ─────────────────────────────────────────
  mesAtual = signal<Date>(new Date());
  diasSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  calendarioGrid = computed(() =>
    this.gerarGradeCalendario(this.mesAtual(), this.agendasDoEspecialista(), this.consultasParaCalendario())
  );

  mesFormatado = computed(() => {
    const m = this.mesAtual();
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${meses[m.getMonth()]} ${m.getFullYear()}`;
  });

  totais = computed(() => {
    const agendas = this.agendasDoEspecialista();
    const consultas = this.consultasParaCalendario();
    return {
      total: agendas.length,
      pendentes: consultas.filter(c => c.status === 'agendada').length,
      confirmados: consultas.filter(c => c.status === 'concluida').length
    };
  });

  /** Data mínima (hoje) para novos dias de atendimento — agendas passadas não aparecem no perfil. */
  get dataMinimaInput(): string {
    const hoje = new Date();
    const y = hoje.getFullYear();
    const m = String(hoje.getMonth() + 1).padStart(2, '0');
    const d = String(hoje.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  constructor() {
    this.agendaForm = this.fb.group({
      data: ['', Validators.required]
    });

    effect(() => {
      const aberto = this.currentAgenda() !== null || this.isNovaAgenda();
      queueMicrotask(() => {
        const dialog = this.agendaDialog()?.nativeElement;
        if (aberto) {
          if (dialog && !dialog.open) dialog.showModal();
          document.body.classList.add('modal-open');
        } else {
          if (dialog?.open) dialog.close();
          document.body.classList.remove('modal-open');
        }
      });
    });

    effect(() => {
      const grupos = this.gruposPorEspecialista();
      if (!this.expansaoInicialAplicada && grupos.length > 0) {
        if (grupos.length === 1) {
          this.gruposExpandidos.set(new Set([grupos[0].especialistaId]));
        }
        this.expansaoInicialAplicada = true;
      }
    });
  }

    ngOnInit() {
    (this.agendasService as AgendasService).loadAll();
    if (this.isGestorOuAdmin()) {
      (this.especialistasService as EspecialistasService).loadEspecialistas();
    }
    if (this.authService.currentUser()) this.carregarPerfilEspecialista();
  }

  // ── Helpers admin ─────────────────────────────────────────────
  private inicioDoDia(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private parseDataBr(data: string): Date {
    if (!data) return new Date(0);
    if (data.includes('-')) {
      const [y, m, d] = data.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    const [d, m, y] = data.split('/').map(Number);
    return new Date(y, m - 1, d);
  }

  private agruparAgendasPorMes(agendas: Agenda[]): { mesLabel: string; agendas: Agenda[] }[] {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const map = new Map<string, Agenda[]>();
    for (const a of agendas) {
      const dt = this.parseDataBr(a.data || '');
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      const mesLabel = `${meses[dt.getMonth()]} ${dt.getFullYear()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
      (map.get(key) as any)._label = mesLabel;
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, lista]) => {
        const dt = this.parseDataBr(lista[0]?.data || '');
        return { mesLabel: `${meses[dt.getMonth()]} ${dt.getFullYear()}`, agendas: lista };
      });
  }

  isGrupoExpandido(especialistaId: number): boolean {
    return this.gruposExpandidos().has(especialistaId);
  }

  toggleGrupo(especialistaId: number): void {
    this.gruposExpandidos.update(s => {
      const next = new Set(s);
      if (next.has(especialistaId)) next.delete(especialistaId);
      else next.add(especialistaId);
      return next;
    });
  }

  expandirTodosGrupos(): void {
    this.gruposExpandidos.set(new Set(this.gruposPorEspecialista().map(g => g.especialistaId)));
  }

  recolherTodosGrupos(): void {
    this.gruposExpandidos.set(new Set());
  }

  limparFiltrosGestor(): void {
    this.filtroBusca.set('');
    this.filtroEspecialistaId.set('todos');
    this.filtroEspecialidade.set('todas');
    this.filtroPeriodo.set('futuras');
  }

  iniciaisNome(nome: string): string {
    return nome.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('');
  }

  isAgendaPassada(data?: string): boolean {
    if (!data) return false;
    return this.parseDataBr(data) < this.inicioDoDia(new Date());
  }

  // ── Normaliza data para DD/MM/YYYY para comparação na grade ──
  private normalizarData(data: string): string {
    if (!data) return '';
    if (data.includes('-')) {
      const p = data.split('-');
      return `${p[2]}/${p[1]}/${p[0]}`;
    }
    return data;
  }

  // ── Gera a grade mensal do calendário ────────────────────────
  private gerarGradeCalendario(baseDate: Date, agendas: any[], consultas: Consulta[]) {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const today = new Date();

    const grid: any[] = [];

    // Dias do mês anterior (padding)
    for (let i = firstDay - 1; i >= 0; i--) {
      grid.push({ dia: daysInPrevMonth - i, isAtual: false, data: null, agendas: [], consultas: [], isHoje: false });
    }

    // Dias do mês atual com agendas/consultas mapeadas
    for (let i = 1; i <= daysInMonth; i++) {
      const dd = i.toString().padStart(2, '0');
      const mm = (month + 1).toString().padStart(2, '0');
      const dateStr = `${dd}/${mm}/${year}`;

      grid.push({
        dia: i,
        isAtual: true,
        data: dateStr,
        agendas: agendas.filter(a => this.normalizarData((a as any).data) === dateStr),
        consultas: consultas.filter(c => this.normalizarData(c.data) === dateStr),
        isHoje: today.getDate() === i && today.getMonth() === month && today.getFullYear() === year
      });
    }

    // Dias do próximo mês (padding)
    const totalSlots = grid.length > 35 ? 42 : 35;
    let nextDay = 1;
    while (grid.length < totalSlots) {
      grid.push({ dia: nextDay++, isAtual: false, data: null, agendas: [], consultas: [], isHoje: false });
    }

    return grid;
  }

  prevMonth() { this.mesAtual.update(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)); }
  nextMonth() { this.mesAtual.update(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)); }
  hoje()      { this.mesAtual.set(new Date()); }

  // ── Perfil do especialista ────────────────────────────────────
  private carregarPerfilEspecialista() {
    const user = this.authService.currentUser();
    if (!user) return;
    this.perfilService.getMe().subscribe({
      next: (data) => {
        this.localAtendimento.set(String(data['localAtendimento'] || ''));
        this.especialidadeEspecialista.set(String(data['especialidade'] || ''));
        this.meuEspecialistaId.set((data['especialistaRegistroId'] as number | null) ?? null);
        this.temCadastroProfissional.set(!!(data['crm'] || data['especialidade']));
      },
      error: () => {
        this.temCadastroProfissional.set(false);
      }
    });
  }

  alternarModoAgenda(modo: 'clinica' | 'minha') {
    this.modoAgenda.set(modo);
  }

  abrirPerfilModal()  { this.isPerfilModalAberto.set(true);  this.perfilSalvo.set(false); }
  fecharPerfilModal() { this.isPerfilModalAberto.set(false); }

  salvarPerfil() {
    this.salvandoPerfil.set(true);
    const payload: any = {};
    if (this.especialidadeEspecialista()) payload['especialidade'] = this.especialidadeEspecialista();
    if (this.localAtendimento()) payload['local_atendimento'] = this.localAtendimento();
    this.http.patch(`${environment.apiUrl}/api/v1/specialists/me`, payload).subscribe({
      next: () => { this.salvandoPerfil.set(false); this.perfilSalvo.set(true); setTimeout(() => this.fecharPerfilModal(), 1200); },
      error: () => { this.salvandoPerfil.set(false); alert('Erro ao salvar perfil.'); }
    });
  }

  // ── Configuração de Agenda ────────────────────────────────────
  adicionarHorario(inputEl: HTMLInputElement) {
    const hora = inputEl.value;
    if (!hora || this.horariosLista().includes(hora)) return;
    this.horariosLista.update(list => [...list, hora].sort());
    this.erroHorarios.set(false);
    const [h, m] = hora.split(':').map(Number);
    inputEl.value = `${(h + 1).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  removerHorario(hora: string) {
    this.horariosLista.update(list => list.filter(h => h !== hora));
  }

  /** Converte DD/MM/YYYY para YYYY-MM-DD (para o input date HTML) */
  private converterParaInputDate(data?: string): string {
    if (!data) return '';
    const p = data.split('/');
    if (p.length === 3) return `${p[2]}-${p[1]}-${p[0]}`;
    // Se já vier em YYYY-MM-DD
    return data;
  }

  abrirConfiguracao(agenda: Agenda | null = null, dataInicialStr?: string) {
    if (!this.podeConfigurarAgenda()) return;
    this.isNovaAgenda.set(agenda === null);
    this.currentAgenda.set(agenda);
    this.erroHorarios.set(false);
    if (agenda) {
      this.agendaForm.patchValue({ data: this.converterParaInputDate(agenda.data) });
      this.horariosLista.set([...agenda.horarios].sort());
    } else {
      this.agendaForm.reset();
      this.horariosLista.set([]);
      if (dataInicialStr) {
        this.agendaForm.patchValue({ data: this.converterParaInputDate(dataInicialStr) });
      }
    }
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
    const dataISO = this.agendaForm.value.data as string;
    const agenda = this.currentAgenda();

    if (!agenda && dataISO < this.dataMinimaInput) {
      alert('Use uma data de hoje em diante. Horários em datas passadas não ficam visíveis para pacientes.');
      return;
    }

    const payload: any = { data: dataISO, horarios, vagas: horarios.length };
    if (agenda) {
      this.agendasService.atualizarAgenda(agenda.id, payload);
      this.fecharModal();
      return;
    }

    this.agendasService.adicionarAgenda(payload as Omit<Agenda, 'id'>).subscribe({
      next: () => this.fecharModal(),
      error: (err) => {
        const msg = err?.error?.message || 'Não foi possível salvar a agenda. Verifique se a organização está selecionada.';
        alert(msg);
      }
    });
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
      this.fecharModalAgendamento();
      alert(`Agendamento confirmado para as ${horario}h com ${agenda.especialista}!\nVocê entrará na fila de espera automaticamente.`);
    }
  }
}
