export interface ClinicaExplorar {
  id: number;
  nome: string;
  tipo: string;
  foto: string;
  cidade: string;
  estado: string;
  enderecoFormatado: string;
  telefone: string;
  totalProfissionais: number;
  especialidades: string[];
  statusVerificacao: string;
}
