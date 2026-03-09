export type UserRole = 'paciente' | 'visualizador' | 'gestor' | 'especialista' | 'admin';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    is_active?: boolean;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}
