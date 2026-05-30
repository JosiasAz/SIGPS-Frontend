import { Injectable, signal } from '@angular/core';
import { AbstractRelatoriosService } from './abstract-relatorios.service';
import { RelatorioResumo } from '../../models/relatorio.model';

const MOCK: RelatorioResumo = {
  meta: {
    organizacao: 'Clínica Demo SIGPS',
    organizacao_id: 1,
    periodo: 'mensal',
    periodo_label: 'Maio 2026',
    gerado_em: '30/05/2026 10:00',
    gerado_por: 'Gestor Demo',
  },
  indicadores: [
    { label: 'Total de Pacientes', value: '128', descricao: 'Cadastrados na organização' },
    { label: 'Consultas no Mês', value: '86', descricao: 'Maio 2026' },
    { label: 'Profissionais Ativos', value: '6', descricao: 'Equipe vinculada' },
    { label: 'Taxa de Conclusão', value: '72%', descricao: 'Consultas concluídas no período' },
    { label: 'Sala de Espera', value: '3', descricao: 'Pacientes aguardando agora' },
    { label: 'Especialidade Líder', value: 'Clínico Geral', descricao: '24 consultas' },
  ],
  consultas_por_status: [
    { status: 'Concluída', total: 62, pct: 72 },
    { status: 'Agendada', total: 18, pct: 21 },
    { status: 'Cancelada', total: 6, pct: 7 },
  ],
  especialidades: [
    { nome: 'Clínico Geral', total: 24, pct: 28 },
    { nome: 'Cardiologia', total: 18, pct: 21 },
    { nome: 'Pediatria', total: 15, pct: 17 },
  ],
  profissionais_ativos: 6,
  agendamentos_serie: [
    { label: 'Sem 1', total: 12, pct: 60 },
    { label: 'Sem 2', total: 20, pct: 100 },
    { label: 'Sem 3', total: 18, pct: 90 },
    { label: 'Sem 4', total: 22, pct: 85 },
    { label: 'Sem 5', total: 14, pct: 70 },
  ],
  genero: [
    { nome: 'Feminino', valor: 72, pct: 56 },
    { nome: 'Masculino', valor: 56, pct: 44 },
  ],
  fila: { total: 3, tempo_medio: '15 min' },
};

@Injectable({
  providedIn: 'root',
})
export class MockedRelatoriosService extends AbstractRelatoriosService {
  relatorio = signal<RelatorioResumo | null>(MOCK);
  carregando = signal(false);
  erro = signal<string | null>(null);

  loadResumo(_periodo?: string): void {
    this.relatorio.set(MOCK);
  }
}
