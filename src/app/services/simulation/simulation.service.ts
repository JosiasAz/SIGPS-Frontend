import { Injectable, signal } from '@angular/core';

export interface SimulatedUser {
  id: number;
  nome: string;
  email: string;
  role: 'paciente' | 'especialista' | 'gestor' | 'admin' | 'visualizador';
  senha: string;
  foto?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  private readonly DB_PREFIX = 'sigps_db_';
  
  // Lista inicial de usuários para o sistema não nascer vazio
  private initialUsers: SimulatedUser[] = [
    { id: 1, nome: 'Dr. Roberto Lins', email: 'dr.roberto@sigps.com', role: 'especialista', senha: '123456', foto: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1000' },
    { id: 2, nome: 'Josias Gestor', email: 'gestor@sigps.com', role: 'gestor', senha: '123456' },
    { id: 3, nome: 'Paciente Teste', email: 'paciente@sigps.com', role: 'paciente', senha: '123456' },
    { id: 4, nome: 'Admin Master', email: 'admin@sigps.com', role: 'admin', senha: '123456' }
  ];

  usuarios = signal<SimulatedUser[]>(this.load('users', this.initialUsers));

  constructor() {}

  // Métodos Genéricos de Persistência
  save(key: string, data: any) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.DB_PREFIX + key, JSON.stringify(data));
    }
  }

  load<T>(key: string, defaultValue: T): T {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(this.DB_PREFIX + key);
      return stored ? JSON.parse(stored) : defaultValue;
    }
    return defaultValue;
  }

  // Gerenciamento de Usuários
  adicionarUsuario(user: Omit<SimulatedUser, 'id'>) {
    const novo = { ...user, id: Date.now() };
    this.usuarios.update(u => {
      const novaLista = [...u, novo];
      this.save('users', novaLista);
      return novaLista;
    });
    return novo;
  }
}
