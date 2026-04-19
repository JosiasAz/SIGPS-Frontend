import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractExamesService, Exame } from './abstract-exames.service';
import { environment } from '../../env/environment';

@Injectable({
  providedIn: 'root'
})
export class ExamesService extends AbstractExamesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  exames = signal<Exame[]>([]);
  
  examesCount = computed(() => this.exames().length);

  constructor() {
    super();
    this.loadExames();
  }

  private loadExames() {
    // Example endpoint - change to match real API
    this.http.get<Exame[]>(`${this.apiUrl}/api/v1/exams/`).subscribe({
      next: (data) => this.exames.set(data),
      error: (err) => console.error('Erro ao buscar exames:', err)
    });
  }

  excluirExame(id: number): void {
    this.http.delete(`${this.apiUrl}/api/v1/exams/${id}/`).subscribe({
      next: () => this.exames.update(prev => prev.filter(e => e.id !== id)),
      error: (err) => console.error('Erro ao excluir exame:', err)
    });
  }

  getExameById(id: number): Exame | undefined {
    return this.exames().find(e => e.id === id);
  }
}
