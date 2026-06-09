import { Component, inject, ViewChild, ElementRef, computed, effect, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Paciente } from '../../../services/pacientes/abstract-pacientes.service';
import { AbstractAgendasService } from '../../../services/agendas/abstract-agendas.service';
import { AbstractAuthService } from '../../../services/auth/abstract-auth.service';
import { PacientesService } from '../../../services/pacientes/pacientes.service';
import { AgendasService } from '../../../services/agendas/agendas.service';
import { OrgSelectorComponent } from '../../../shared/org-selector/org-selector.component';

type PacienteLista = Paciente & { temAgendamento: boolean };

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule, OrgSelectorComponent],
  templateUrl: './pacientes.html',
  styleUrls: ['./pacientes.scss', '../painel.scss'],
})
export class PacientesComponent implements OnInit, OnDestroy {
  private pacientesService = inject(PacientesService);
  private agendasService = inject(AbstractAgendasService);
  private authService = inject(AbstractAuthService);

  @ViewChild('deleteModal') deleteModal!: ElementRef<HTMLDialogElement>;

  filtroNome = signal('');
  filtroCpf = signal('');
  private searchTimer?: ReturnType<typeof setTimeout>;

  isAdmin = computed(() => this.authService.userRole() === 'admin');
  organizations = this.authService.organizations;
  activeOrganizationId = this.authService.activeOrganizationId;
  mostrarColunaClinica = computed(() => this.isAdmin() && this.activeOrganizationId() === 0);

  currentPage = this.pacientesService.currentPage;
  totalPages = this.pacientesService.totalPages;
  totalPacientes = this.pacientesService.totalPacientes;
  perPage = this.pacientesService.perPage;
  isLoadingList = this.pacientesService.isLoadingList;

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
        this.pacientesService.invalidateCache();
        this.loadPage(1);
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

    return cadastrados.map(p => {
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
    });
  }

  private parseDataBr(data: string): number {
    const partes = data.split('/');
    if (partes.length !== 3) return 0;
    const [dia, mes, ano] = partes.map(Number);
    return new Date(ano, mes - 1, dia).getTime();
  }

  ngOnInit() {
    this.loadPage(1);
    (this.agendasService as AgendasService).loadAll();
  }

  ngOnDestroy() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
  }

  private filtrosAtuais() {
    return {
      nome: this.filtroNome().trim() || undefined,
      cpf: this.filtroCpf().trim() || undefined,
    };
  }

  loadPage(page: number) {
    this.pacientesService.loadPacientes({
      paginate: true,
      page,
      perPage: this.perPage(),
      ...this.filtrosAtuais(),
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.loadPage(page);
  }

  changePerPage(value: number) {
    this.perPage.set(value);
    this.loadPage(1);
  }

  paginationRange(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const maxButtons = 5;
    let start = Math.max(1, current - Math.floor(maxButtons / 2));
    let end = Math.min(total, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  rangeLabel(): string {
    const total = this.totalPacientes();
    if (total === 0) return 'Nenhum paciente encontrado';
    const start = (this.currentPage() - 1) * this.perPage() + 1;
    const end = Math.min(this.currentPage() * this.perPage(), total);
    return `Exibindo ${start}–${end} de ${total} pacientes`;
  }

  onFiltroChange() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadPage(1), 300);
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
    this.loadPage(1);
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
