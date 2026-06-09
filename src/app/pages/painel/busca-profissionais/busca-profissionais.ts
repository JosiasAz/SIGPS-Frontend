import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EspecialistasService } from '../../../services/especialistas/especialistas.service';
import { AvatarUrlPipe } from '../../../pipes/avatar-url.pipe';
import { AvatarFallbackDirective } from '../../../directives/avatar-fallback.directive';
import { labelVerificacao } from '../../../utils/verificacao.util';

@Component({
  selector: 'app-busca-profissionais',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule, AvatarUrlPipe, AvatarFallbackDirective],
  templateUrl: './busca-profissionais.html',
  styleUrls: ['./busca-profissionais.scss']
})
export class BuscaProfissionaisComponent implements OnInit, OnDestroy {
  private especialistasService = inject(EspecialistasService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private searchTimer?: ReturnType<typeof setTimeout>;

  searchQuery = signal('');
  selectedEspecialidade = signal('Todas');
  carregando = signal(false);
  clinicaFiltroId = signal<number | null>(null);
  clinicaFiltroNome = signal<string | null>(null);

  labelVerificacao = labelVerificacao;

  especialidades = computed(() => {
    const fromApi = this.especialistasService.especialidadesDisponiveis();
    if (fromApi.length > 1) return fromApi;

    const fromPros = [...new Set(
      this.especialistasService.especialistas()
        .map(p => p.especialidade?.trim())
        .filter((e): e is string => !!e)
    )].sort((a, b) => a.localeCompare(b, 'pt-BR'));

    return fromPros.length ? ['Todas', ...fromPros] : ['Todas'];
  });

  profissionaisFiltrados = computed(() => this.especialistasService.especialistas());
  currentPage = this.especialistasService.currentPage;
  totalPages = this.especialistasService.totalPages;
  totalEspecialistas = this.especialistasService.totalEspecialistas;
  perPage = this.especialistasService.perPage;

  ngOnInit() {
    this.especialistasService.loadEspecialidades();

    this.route.queryParams.subscribe(params => {
      if (params['especialidade']) {
        this.selectedEspecialidade.set(params['especialidade']);
      }
      if (params['clinica']) {
        const id = parseInt(params['clinica'], 10);
        this.clinicaFiltroId.set(isNaN(id) ? null : id);
        this.clinicaFiltroNome.set(params['clinicaNome'] || null);
      } else {
        this.clinicaFiltroId.set(null);
        this.clinicaFiltroNome.set(null);
      }
      this.aplicarBusca();
    });
  }

  ngOnDestroy() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
  }

  onSearchChange(value: string) {
    this.searchQuery.set(value);
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.aplicarBusca(), 300);
  }

  setEspecialidade(esp: string) {
    this.selectedEspecialidade.set(esp);
    this.aplicarBusca();
  }

  private aplicarBusca(page = 1) {
    const hadData = this.especialistasService.especialistas().length > 0;
    this.carregando.set(!hadData);
    this.especialistasService.loadEspecialistas({
      paginate: true,
      page,
      perPage: this.perPage(),
      nome: this.searchQuery(),
      especialidade: this.selectedEspecialidade(),
      organizationId: this.clinicaFiltroId(),
    }, false, () => this.carregando.set(false));
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.aplicarBusca(page);
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
    const total = this.totalEspecialistas();
    if (total === 0) return 'Nenhum profissional encontrado';
    const start = (this.currentPage() - 1) * this.perPage() + 1;
    const end = Math.min(this.currentPage() * this.perPage(), total);
    return `Exibindo ${start}–${end} de ${total} profissionais`;
  }

  limparFiltros() {
    this.searchQuery.set('');
    this.selectedEspecialidade.set('Todas');
    this.clinicaFiltroId.set(null);
    this.clinicaFiltroNome.set(null);
    this.router.navigate(['/painel/busca-profissionais']);
    this.aplicarBusca();
  }

  limparClinicaFiltro() {
    this.router.navigate(['/painel/busca-profissionais'], {
      queryParams: { especialidade: this.selectedEspecialidade() !== 'Todas' ? this.selectedEspecialidade() : undefined },
    });
  }

  iniciarChat(proId: number, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/painel/chat'], { queryParams: { with: proId } });
  }
}
