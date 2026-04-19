export interface Profissional {
  id: number;
  nome: string;
  especialidade: string;
  crm: string;
  avaliacao: number;
  avaliacoesCount: number;
  foto?: string;
  proximaVaga?: string;
  documento?: string;
  status?: string;
  consultasRealizadas?: number;
  anosExperiencia?: number;
  taxaRetorno?: number;
  sobre?: string;
  formacao?: { titulo: string; instituicao: string; ano: string }[];
  servicos?: string[];
  avaliacoes?: { nome: string; nota: number; texto: string; data: string }[];
  banner?: string;
  estatisticas?: { pacientesHoje: number, consultasMes: number, faturamentoMes: string, satisfacao: string };
  agendaHoje?: { hora: string, paciente: string, tipo: string, status: string }[];
  diasDisponiveis?: { data: string, diasemana: string, slots: string[] }[];
}
