export interface Paciente {
    id: number;
    nome: string;
    cpf: string;
    ultimaConsulta: string;
    especialidade: string;
    organizacao?: string;
    avatar?: string;
}
