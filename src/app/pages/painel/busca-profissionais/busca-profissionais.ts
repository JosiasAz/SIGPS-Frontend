import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AbstractEspecialistasService } from '../../../services/especialistas/abstract-especialistas.service';
import { EspecialistasService } from '../../../services/especialistas/especialistas.service';
import { MediaUrlPipe } from '../../../pipes/media-url.pipe';
import { labelVerificacao } from '../../../utils/verificacao.util';

@Component({
  selector: 'app-busca-profissionais',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule, MediaUrlPipe],
  templateUrl: './busca-profissionais.html',
  styleUrls: ['./busca-profissionais.scss']
})
export class BuscaProfissionaisComponent implements OnInit, OnDestroy {
  private especialistasService = inject(AbstractEspecialistasService);
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
    const svc = this.especialistasService as EspecialistasService;
    const fromApi = svc.especialidadesDisponiveis?.() ?? [];
    if (fromApi.length > 1) return fromApi;

    const fromPros = [...new Set(
      this.especialistasService.especialistas()
        .map(p => p.especialidade?.trim())
        .filter((e): e is string => !!e)
    )].sort((a, b) => a.localeCompare(b, 'pt-BR'));

    return fromPros.length ? ['Todas', ...fromPros] : ['Todas'];
  });

  profissionaisFiltrados = computed(() => this.especialistasService.especialistas());

  ngOnInit() {
    const svc = this.especialistasService as EspecialistasService;
    svc.loadEspecialidades();

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

  private aplicarBusca() {
    const svc = this.especialistasService as EspecialistasService;
    const hadData = svc.especialistas().length > 0;
    this.carregando.set(!hadData);
    svc.loadEspecialistas({
      nome: this.searchQuery(),
      especialidade: this.selectedEspecialidade(),
      organizationId: this.clinicaFiltroId(),
    }, false, () => this.carregando.set(false));
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
