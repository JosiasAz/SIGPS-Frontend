import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractRelatoriosService } from './abstract-relatorios.service';
import { environment } from '../../env/environment';
import { AbstractAuthService } from '../auth/abstract-auth.service';
import { RelatorioResumo } from '../../models/relatorio.model';
import { API_ENDPOINTS } from '../../config/endpoints';

@Injectable({
  providedIn: 'root',
})
export class RelatoriosService extends AbstractRelatoriosService {
  private http = inject(HttpClient);
  private authService = inject(AbstractAuthService);
  private apiUrl = environment.apiUrl;

  relatorio = signal<RelatorioResumo | null>(null);
  carregando = signal(false);
  erro = signal<string | null>(null);

  private loadedKey = '';

  loadResumo(periodo: string = 'mensal'): void {
    const orgId = this.authService.activeOrganizationId();
    const key = `${orgId}-${periodo}`;
    if (this.loadedKey === key && this.relatorio()) return;

    let url = `${this.apiUrl}${API_ENDPOINTS.RELATORIOS.RESUMO}?periodo=${periodo}`;
    if (orgId !== null && orgId !== undefined) {
      url += `&organization_id=${orgId}`;
    }

    this.carregando.set(true);
    this.erro.set(null);

    this.http.get<RelatorioResumo>(url).subscribe({
      next: (data) => {
        this.relatorio.set(data);
        this.loadedKey = key;
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(err?.error?.message || 'Não foi possível carregar o relatório.');
        this.relatorio.set(null);
      },
    });
  }

  invalidateCache(): void {
    this.loadedKey = '';
  }
}
