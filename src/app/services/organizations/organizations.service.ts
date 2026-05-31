import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../env/environment';
import { ClinicaExplorar } from '../../models/clinica.model';
import { Profissional } from '../../models/profissional.model';
import { cacheGet, cacheSet, cacheInvalidate, cacheKey } from '../../utils/api-cache';

const TTL_MS = 5 * 60 * 1000;

const DEMO_CLINICAS_EXPLORAR: ClinicaExplorar[] = [
  {
    id: 1,
    nome: 'Clínica Saúde & Vida',
    tipo: 'CLINICA',
    foto: 'https://ui-avatars.com/api/?name=Saude+Vida&background=419640&color=fff&size=256&bold=true',
    cidade: 'São Paulo',
    estado: 'SP',
    enderecoFormatado: 'Av. Paulista, 1000 — Bela Vista',
    telefone: '(11) 3000-0000',
    totalProfissionais: 8,
    especialidades: ['Cardiologia', 'Clínico Geral', 'Pediatria'],
    statusVerificacao: 'verificado',
  },
  {
    id: 2,
    nome: 'Consultório Dr. Silva',
    tipo: 'CONSULTORIO',
    foto: 'https://ui-avatars.com/api/?name=Dr+Silva&background=2d6a4f&color=fff&size=256&bold=true',
    cidade: 'Campinas',
    estado: 'SP',
    enderecoFormatado: 'Rua das Flores, 220 — Centro',
    telefone: '(19) 3200-0000',
    totalProfissionais: 3,
    especialidades: ['Dermatologia', 'Nutrição'],
    statusVerificacao: 'verificado',
  },
  {
    id: 3,
    nome: 'Centro Médico Horizonte',
    tipo: 'CLINICA',
    foto: 'https://ui-avatars.com/api/?name=Horizonte&background=1b4332&color=fff&size=256&bold=true',
    cidade: 'Santos',
    estado: 'SP',
    enderecoFormatado: 'Av. Ana Costa, 55 — Gonzaga',
    telefone: '(13) 3100-0000',
    totalProfissionais: 12,
    especialidades: ['Ortopedia', 'Fisioterapia', 'Psicologia'],
    statusVerificacao: 'pendente',
  },
];

export interface ExplorarClinicasFiltros {
  nome?: string;
  cidade?: string;
  tipo?: string;
}

@Injectable({ providedIn: 'root' })
export class OrganizationsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  explorarClinicas(filtros: ExplorarClinicasFiltros = {}, force = false): Observable<ClinicaExplorar[]> {
    if (environment.useMock) {
      let lista = [...DEMO_CLINICAS_EXPLORAR];
      const nome = filtros.nome?.trim().toLowerCase();
      const cidade = filtros.cidade?.trim().toLowerCase();
      if (nome) lista = lista.filter(c => c.nome.toLowerCase().includes(nome));
      if (cidade) lista = lista.filter(c => (c.cidade || '').toLowerCase().includes(cidade));
      return of(lista);
    }

    let params = new HttpParams();
    if (filtros.nome?.trim()) params = params.set('nome', filtros.nome.trim());
    if (filtros.cidade?.trim()) params = params.set('cidade', filtros.cidade.trim());
    if (filtros.tipo?.trim()) params = params.set('tipo', filtros.tipo.trim());

    const key = cacheKey(['orgs', 'explorar', params.toString()]);
    const cached = !force ? cacheGet<ClinicaExplorar[]>(key, { session: true }) : null;
    if (cached) return of(cached);

    return this.http.get<ClinicaExplorar[]>(
      `${this.apiUrl}/api/v1/organizations/explorar`,
      { params }
    ).pipe(
      tap(data => cacheSet(key, data, TTL_MS, { session: true })),
      catchError(() => this.fallbackDesdeProfissionais(filtros))
    );
  }

  /** Leitura síncrona do cache — exibe lista na hora ao abrir Explorar. */
  peekExplorarClinicas(filtros: ExplorarClinicasFiltros = {}): ClinicaExplorar[] | null {
    let params = new HttpParams();
    if (filtros.nome?.trim()) params = params.set('nome', filtros.nome.trim());
    if (filtros.cidade?.trim()) params = params.set('cidade', filtros.cidade.trim());
    if (filtros.tipo?.trim()) params = params.set('tipo', filtros.tipo.trim());
    const key = cacheKey(['orgs', 'explorar', params.toString()]);
    return cacheGet<ClinicaExplorar[]>(key, { session: true });
  }

  /** Agrupa profissionais por clínica quando /explorar ainda não está no servidor. */
  private fallbackDesdeProfissionais(filtros: ExplorarClinicasFiltros): Observable<ClinicaExplorar[]> {
    return this.http.get<Profissional[]>(`${this.apiUrl}/api/v1/specialists/`).pipe(
      map((profissionais) => {
        const porOrg = new Map<number, ClinicaExplorar & { _esps: Set<string> }>();

        for (const p of profissionais) {
          const orgId = p.organizationId;
          const orgNome = p.organizationNome?.trim();
          if (!orgId || !orgNome) continue;

          let entry = porOrg.get(orgId);
          if (!entry) {
            const fotoNome = encodeURIComponent(orgNome.replace(/\s+/g, '+'));
            entry = {
              id: orgId,
              nome: orgNome,
              tipo: 'CONSULTORIO',
              foto: `https://ui-avatars.com/api/?name=${fotoNome}&background=419640&color=fff&size=256&bold=true`,
              cidade: '',
              estado: '',
              enderecoFormatado: p.localAtendimento || '',
              telefone: '',
              totalProfissionais: 0,
              especialidades: [],
              statusVerificacao: 'pendente',
              _esps: new Set<string>(),
            };
            porOrg.set(orgId, entry);
          }
          entry.totalProfissionais += 1;
          if (p.especialidade?.trim()) entry._esps.add(p.especialidade.trim());
          if (!entry.enderecoFormatado && p.localAtendimento) {
            entry.enderecoFormatado = p.localAtendimento;
          }
        }

        let lista = Array.from(porOrg.values()).map(({ _esps, ...c }) => ({
          ...c,
          especialidades: Array.from(_esps).sort((a, b) => a.localeCompare(b, 'pt-BR')),
        }));

        const nome = filtros.nome?.trim().toLowerCase();
        const cidade = filtros.cidade?.trim().toLowerCase();
        if (nome) lista = lista.filter(c => c.nome.toLowerCase().includes(nome));
        if (cidade) {
          lista = lista.filter(c =>
            c.cidade.toLowerCase().includes(cidade) ||
            c.enderecoFormatado.toLowerCase().includes(cidade)
          );
        }
        return lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      }),
      catchError(() => of([]))
    );
  }
}
