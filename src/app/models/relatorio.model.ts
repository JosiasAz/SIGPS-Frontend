export interface RelatorioIndicador {
  label: string;
  value: string;
  descricao: string;
}

export interface RelatorioSerieItem {
  label: string;
  total: number;
  pct: number;
}

export interface RelatorioStatusItem {
  status: string;
  total: number;
  pct: number;
}

export interface RelatorioEspecialidade {
  nome: string;
  total: number;
  pct: number;
}

export interface RelatorioGeneroItem {
  nome: string;
  valor: number;
  pct: number;
}

export interface RelatorioMeta {
  organizacao: string;
  organizacao_id: number;
  periodo: string;
  periodo_label: string;
  gerado_em: string;
  gerado_por: string;
}

export interface RelatorioResumo {
  meta: RelatorioMeta;
  indicadores: RelatorioIndicador[];
  consultas_por_status: RelatorioStatusItem[];
  especialidades: RelatorioEspecialidade[];
  profissionais_ativos: number;
  agendamentos_serie: RelatorioSerieItem[];
  genero: RelatorioGeneroItem[];
  fila: { total: number; tempo_medio: string };
}
