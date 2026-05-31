import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { OrganizationsService } from '../../../services/organizations/organizations.service';
import { ClinicaExplorar } from '../../../models/clinica.model';
import { labelVerificacao } from '../../../utils/verificacao.util';
import { AvatarUrlPipe } from '../../../pipes/avatar-url.pipe';
import { AvatarFallbackDirective } from '../../../directives/avatar-fallback.directive';

@Component({
  selector: 'app-explorar-clinicas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, AvatarUrlPipe, AvatarFallbackDirective],
  templateUrl: './explorar-clinicas.html',
  styleUrls: ['./explorar-clinicas.scss'],
})
export class ExplorarClinicasComponent implements OnInit, OnDestroy {
  private orgService = inject(OrganizationsService);
  private router = inject(Router);
  private searchTimer?: ReturnType<typeof setTimeout>;

  clinica = signal<ClinicaExplorar[]>([]);
  carregando = signal(false);
  filtroNome = signal('');
  filtroCidade = signal('');
  labelVerificacao = labelVerificacao;

  ngOnInit() {
    const cached = this.orgService.peekExplorarClinicas({});
    if (cached?.length) this.clinica.set(cached);
    this.buscar();
  }

  ngOnDestroy() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
  }

  onFiltroChange() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.buscar(), 300);
  }

  buscar() {
    const hadData = this.clinica().length > 0;
    this.carregando.set(!hadData);
    this.orgService.explorarClinicas({
      nome: this.filtroNome(),
      cidade: this.filtroCidade(),
    }).subscribe({
      next: (data) => {
        this.clinica.set(data);
        this.carregando.set(false);
      },
      error: () => {
        this.clinica.set([]);
        this.carregando.set(false);
      },
    });
  }

  limparFiltros() {
    this.filtroNome.set('');
    this.filtroCidade.set('');
    this.buscar();
  }

  verProfissionais(clinica: ClinicaExplorar) {
    this.router.navigate(['/painel/busca-profissionais'], {
      queryParams: { clinica: clinica.id, clinicaNome: clinica.nome },
    });
  }

  tipoLabel(tipo: string): string {
    const map: Record<string, string> = {
      CLINICA: 'Clínica',
      CONSULTORIO: 'Consultório',
      AUTONOMO: 'Autônomo',
    };
    return map[tipo] || tipo;
  }
}
