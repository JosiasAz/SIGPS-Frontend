export interface Profissional {
  id: number;
  nome: string;
  especialidade: string;
  crm: string;
  avaliacao?: number | null;
  avaliacoesCount?: number;
  foto?: string;
  proximaVaga?: string;
  localAtendimento?: string;
  organizationId?: number | null;
  organizationNome?: string;
  documento?: string;
  status?: string; // Mantido por retrocompatibilidade com UI antiga, mas agora computado
  situacao?: 'Ativo' | 'Inativo';
  statusVerificacao?: 'nao_verificado' | 'em_analise' | 'verificado' | 'rejeitado';
  last_seen?: Date | string;
  uf?: string;
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
  diasDisponiveis?: { agendaId: number, data: string, diasemana: string, slots: (string | { hora: string, disponivel: boolean, agendaId?: number })[] }[];
}
