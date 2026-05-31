export type StatusVerificacao = 'nao_verificado' | 'em_analise' | 'verificado' | 'rejeitado';

const LABELS: Record<StatusVerificacao, string> = {
  nao_verificado: 'Não verificado',
  em_analise: 'Em análise',
  verificado: 'Verificado',
  rejeitado: 'Rejeitado',
};

export function labelVerificacao(status?: string): string {
  if (!status) return LABELS.nao_verificado;
  return LABELS[status as StatusVerificacao] ?? status;
}

export function isProfissionalPublico(status?: string): boolean {
  return status === 'verificado';
}
