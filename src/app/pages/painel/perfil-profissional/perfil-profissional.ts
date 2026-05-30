import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { AbstractAuthService } from '../../../services/auth/abstract-auth.service';
import { AbstractEspecialistasService, Profissional } from '../../../services/especialistas/abstract-especialistas.service';
import { AbstractAgendasService } from '../../../services/agendas/abstract-agendas.service';
import { AgendasService } from '../../../services/agendas/agendas.service';
import { Agenda } from '../../../models/agenda.model';
import { MediaUrlPipe } from '../../../pipes/media-url.pipe';
import { labelVerificacao, isProfissionalPublico } from '../../../utils/verificacao.util';

interface SlotDisponivel {
  hora: string;
  agendaId: number;
  disponivel: boolean;
}

interface DiaDisponivel {
  data: string;
  diasemana: string;
  slots: SlotDisponivel[];
}
@Component({
  selector: 'app-perfil-profissional',
  standalone: true,
  imports: [CommonModule, RouterLink, MediaUrlPipe],
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

  agendaHoje = signal<any[]>([]);
  private readonly DIAS_POR_PAGINA = 5;
  private readonly MAX_DIAS_FUTUROS = 14;

  diasDisponiveisBrutos = signal<DiaDisponivel[]>([]);
  diasPaginaAtual = signal(1);

  diasDisponiveisNormalizados = computed(() => this.diasDisponiveisBrutos());
  diasDisponiveisVisiveis = computed(() => {
    const limite = this.diasPaginaAtual() * this.DIAS_POR_PAGINA;
    return this.diasDisponiveisNormalizados().slice(0, limite);
  });
  totalDiasDisponiveis = computed(() => this.diasDisponiveisNormalizados().length);
  temMaisDias = computed(() => this.diasDisponiveisVisiveis().length < this.totalDiasDisponiveis());

  selectedSlot = signal<{ agendaId: number, dia: string, slot: string } | null>(null);
  selectedPacienteProntuario = signal<any>(null);
  carregandoHorarios = signal(false);

  labelVerificacao = labelVerificacao;
  profissionalVerificado = computed(() => isProfissionalPublico(this.profissional()?.statusVerificacao));

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id')) || 0;
      this.diasPaginaAtual.set(1);
      this.selectedSlot.set(null);
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
    if (prof.agendaHoje) this.agendaHoje.set(prof.agendaHoje);

    const diasPerfil = prof.diasDisponiveis?.length
      ? this.mapearDiasDaApi(prof.diasDisponiveis)
      : [];

    const agendasSvc = this.agendasService as AgendasService;
    if (typeof agendasSvc.buscarHorariosEspecialista === 'function') {
      this.carregandoHorarios.set(true);
      agendasSvc.buscarHorariosEspecialista(prof.id).subscribe({
        next: (agendas) => {
          const diasAgendas = this.mapearAgendasParaDias(agendas);
          this.diasDisponiveisBrutos.set(this.normalizarDias([...diasPerfil, ...diasAgendas]));
          this.diasPaginaAtual.set(1);
          this.carregandoHorarios.set(false);
        },
        error: () => {
          const fallback = this.mapearDiasDasAgendas(prof.id);
          this.diasDisponiveisBrutos.set(this.normalizarDias([...diasPerfil, ...fallback]));
          this.diasPaginaAtual.set(1);
          this.carregandoHorarios.set(false);
        },
      });
      return;
    }

    const fallback = diasPerfil.length ? diasPerfil : this.mapearDiasDasAgendas(prof.id);
    this.diasDisponiveisBrutos.set(this.normalizarDias(fallback));
    this.diasPaginaAtual.set(1);
  }

  private mapearAgendasParaDias(agendas: Agenda[]): DiaDisponivel[] {
    return agendas
      .filter(a => a.data && (a.slots?.length || a.horarios?.length))
      .map(a => ({
        data: this.formatarDataExibicao(a.data as string),
        diasemana: '',
        slots: this.slotsDaAgenda(a),
      }));
  }

  private slotsDaAgenda(agenda: Agenda): SlotDisponivel[] {
    if (agenda.slots?.length) {
      return agenda.slots.map(s => ({
        hora: s.hora,
        agendaId: s.agendaId ?? agenda.id,
        disponivel: s.disponivel,
      }));
    }
    return (agenda.horarios || []).map(hora => ({
      hora,
      agendaId: agenda.id,
      disponivel: true,
    }));
  }

  private mapearSlotDaApi(
    slot: string | { hora: string; disponivel?: boolean; agendaId?: number },
    agendaIdPadrao: number
  ): SlotDisponivel {
    if (typeof slot === 'string') {
      return { hora: slot, agendaId: agendaIdPadrao, disponivel: true };
    }
    return {
      hora: slot.hora,
      agendaId: slot.agendaId ?? agendaIdPadrao,
      disponivel: slot.disponivel ?? true,
    };
  }

  private mapearDiasDaApi(dias: NonNullable<Profissional['diasDisponiveis']>): DiaDisponivel[] {
    return dias.map(dia => ({
      data: dia.data,
      diasemana: dia.diasemana || '',
      slots: (dia.slots || []).map(s => this.mapearSlotDaApi(s, dia.agendaId)),
    }));
  }

  private mapearDiasDasAgendas(especialistaUserId: number): DiaDisponivel[] {
    const agendas = this.agendasService.agendas();
    return agendas
      .filter(a =>
        a.especialistaUserId === especialistaUserId ||
        (a as any).especialistaId === especialistaUserId
      )
      .filter(a => a.data && (a.slots?.length || a.horarios?.length))
      .map(a => ({
        data: this.formatarDataExibicao(a.data as string),
        diasemana: '',
        slots: this.slotsDaAgenda(a),
      }));
  }

  private mesclarSlot(mapa: Map<string, SlotDisponivel>, slot: SlotDisponivel) {
    const existente = mapa.get(slot.hora);
    if (!existente) {
      mapa.set(slot.hora, slot);
      return;
    }
    if (!slot.disponivel || !existente.disponivel) {
      mapa.set(slot.hora, {
        hora: slot.hora,
        disponivel: false,
        agendaId: !slot.disponivel ? slot.agendaId : existente.agendaId,
      });
      return;
    }
    mapa.set(slot.hora, existente);
  }

  private normalizarDias(dias: DiaDisponivel[]): DiaDisponivel[] {
    const porData = new Map<string, { data: string; diasemana: string; slots: Map<string, SlotDisponivel> }>();

    for (const dia of dias) {
      const chave = this.normalizarDataChave(dia.data);
      if (!chave || !this.isDataFuturaOuHoje(chave)) continue;

      const atual = porData.get(chave) ?? {
        data: dia.data,
        diasemana: dia.diasemana,
        slots: new Map<string, SlotDisponivel>(),
      };

      if (!atual.diasemana && dia.diasemana) atual.diasemana = dia.diasemana;

      for (const slot of dia.slots) {
        if (slot.hora) this.mesclarSlot(atual.slots, slot);
      }

      porData.set(chave, atual);
    }

    return Array.from(porData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, this.MAX_DIAS_FUTUROS)
      .map(([, dia]) => ({
        data: dia.data,
        diasemana: dia.diasemana || this.diaSemanaPorData(dia.data),
        slots: Array.from(dia.slots.values()).sort((a, b) => a.hora.localeCompare(b.hora)),
      }))
      .filter(dia => dia.slots.length > 0);
  }

  private normalizarDataChave(data: string): string {
    if (!data) return '';
    if (data.includes('/')) {
      const [dia, mes, ano] = data.split('/');
      const anoCompleto = ano?.length === 4 ? ano : `${new Date().getFullYear()}`;
      return `${anoCompleto}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
    return data;
  }

  private isDataFuturaOuHoje(isoDate: string): boolean {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const alvo = new Date(`${isoDate}T00:00:00`);
    return alvo >= hoje;
  }

  private diaSemanaPorData(data: string): string {
    const chave = this.normalizarDataChave(data);
    if (!chave) return '';
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return dias[new Date(`${chave}T00:00:00`).getDay()];
  }

  carregarMaisDias() {
    this.diasPaginaAtual.update(p => p + 1);
  }
  private formatarDataExibicao(data: string): string {
    if (!data) return '';
    if (data.includes('/')) {
      const partes = data.split('/');
      if (partes.length === 3) return `${partes[0]}/${partes[1]}/${partes[2]}`;
      return partes.length >= 2 ? `${partes[0]}/${partes[1]}` : data;
    }
    const [ano, mes, dia] = data.split('-');
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : data;
  }

  calcularStatusVisao(last_seen?: Date | string | null, statusDefault?: string): string {
    if (!last_seen) return statusDefault === 'online' ? 'Online' : 'Offline';
    const diff = (new Date().getTime() - new Date(last_seen).getTime()) / (1000 * 60);
    return diff <= 5 ? 'Online' : 'Offline';
  }

  selecionarHorario(agendaId: number, dia: string, slot: string, disponivel: boolean) {
    if (!disponivel) return;
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
