import { Component, inject, ViewChild, ElementRef, computed, effect, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AbstractPacientesService, Paciente } from '../../../services/pacientes/abstract-pacientes.service';
import { AbstractAgendasService } from '../../../services/agendas/abstract-agendas.service';
import { AbstractAuthService } from '../../../services/auth/abstract-auth.service';
import { PacientesService } from '../../../services/pacientes/pacientes.service';
import { AgendasService } from '../../../services/agendas/agendas.service';
import { AppRefreshService } from '../../../services/app-refresh.service';

type PacienteLista = Paciente & { temAgendamento: boolean };

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes.html',
  styleUrls: ['./pacientes.scss', '../painel.scss'],
})
export class PacientesComponent implements OnInit, OnDestroy {
  private pacientesService = inject(AbstractPacientesService);
  private agendasService = inject(AbstractAgendasService);
  private authService = inject(AbstractAuthService);
  private appRefresh = inject(AppRefreshService);

  @ViewChild('deleteModal') deleteModal!: ElementRef<HTMLDialogElement>;

  filtroNome = signal('');
  filtroCpf = signal('');
  private searchTimer?: ReturnType<typeof setTimeout>;

  isAdmin = computed(() => this.authService.userRole() === 'admin');
  organizations = this.authService.organizations;
  activeOrganizationId = this.authService.activeOrganizationId;
  mostrarColunaClinica = computed(() => this.isAdmin() && this.activeOrganizationId() === 0);

  clinicaAtivaLabel = computed(() => {
    const orgId = this.activeOrganizationId();
    if (orgId === 0) return 'Todas as clínicas';
    return this.organizations().find(o => o.id === orgId)?.nome ?? 'Clínica selecionada';
  });

  pacientes = computed(() => this.enriquecerPacientesComAgenda());

  deletingPacienteId: number | null = null;
  deletingPacienteNome: string = '';
  private ultimaOrgCarregada: number | null | undefined = undefined;

  constructor() {
    effect(() => {
      const orgId = this.authService.activeOrganizationId();
      if (orgId === null || orgId === undefined) return;
      if (this.ultimaOrgCarregada !== undefined && this.ultimaOrgCarregada !== orgId) {
        (this.pacientesService as PacientesService).invalidateCache();
        (this.pacientesService as PacientesService).loadPacientes();
        (this.agendasService as AgendasService).loadAll();
      }
      this.ultimaOrgCarregada = orgId;
    });
  }

  private enriquecerPacientesComAgenda(): PacienteLista[] {
    const cadastrados = this.pacientesService.pacientes();
    const consultas = this.agendasService.consultas().filter(c => c.status !== 'cancelada');

    const consultasPorPaciente = new Map<number, typeof consultas>();
    for (const c of consultas) {
      if (c.pacienteId == null) continue;
      const lista = consultasPorPaciente.get(c.pacienteId) ?? [];
      lista.push(c);
      consultasPorPaciente.set(c.pacienteId, lista);
    }

    return cadastrados
      .map(p => {
        const doPaciente = consultasPorPaciente.get(p.id) ?? [];
        const ultima = doPaciente.reduce<string | undefined>((acc, c) => {
          if (!c.data) return acc;
          if (!acc) return c.data;
          return this.parseDataBr(c.data) >= this.parseDataBr(acc) ? c.data : acc;
        }, undefined);
        const especialidade = doPaciente.find(c => c.especialidade)?.especialidade ?? p.especialidade;

        return {
          ...p,
          ultimaConsulta: ultima ?? p.ultimaConsulta ?? '—',
          especialidade: especialidade || '—',
          temAgendamento: doPaciente.length > 0,
        };
      })
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  private parseDataBr(data: string): number {
    const partes = data.split('/');
    if (partes.length !== 3) return 0;
    const [dia, mes, ano] = partes.map(Number);
    return new Date(ano, mes - 1, dia).getTime();
  }

  ngOnInit() {
    (this.pacientesService as PacientesService).loadPacientes();
    (this.agendasService as AgendasService).loadAll();
  }

  ngOnDestroy() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
  }

  onClinicaChange(orgIdVal: string | number) {
    const orgId = typeof orgIdVal === 'number' ? orgIdVal : parseInt(orgIdVal, 10);
    if (isNaN(orgId)) return;
    this.authService.setActiveOrganization(orgId);
    this.appRefresh.onOrganizationChanged();
  }

  onFiltroChange() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      (this.pacientesService as PacientesService).loadPacientes({
        nome: this.filtroNome(),
        cpf: this.filtroCpf(),
      });
    }, 300);
  }

  onCpfChange(valor: string) {
    const digits = valor.replace(/\D/g, '').slice(0, 11);
    let formatado = digits;
    if (digits.length > 3) formatado = `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length > 6) formatado = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    if (digits.length > 9) formatado = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    this.filtroCpf.set(formatado);
    this.onFiltroChange();
  }

  limparFiltros() {
    this.filtroNome.set('');
    this.filtroCpf.set('');
    (this.pacientesService as PacientesService).loadPacientes();
  }

  excluirPaciente(id: number, nome: string): void {
    this.deletingPacienteId = id;
    this.deletingPacienteNome = nome;
    this.deleteModal.nativeElement.showModal();
  }

  fecharModalExclusao(): void {
    this.deleteModal.nativeElement.close();
    this.deletingPacienteId = null;
    this.deletingPacienteNome = '';
  }

  confirmarExclusao(): void {
    if (this.deletingPacienteId !== null) {
      this.pacientesService.excluirPaciente(this.deletingPacienteId);
      this.fecharModalExclusao();
    }
  }
}
