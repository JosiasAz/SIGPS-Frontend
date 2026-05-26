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

  loadExames() {
    this.http.get<any[]>(`${this.apiUrl}/api/v1/exams/me`).subscribe({
      next: (data) => {
        // Map backend format to frontend format
        const mapped = data.map(e => ({
          id: e.id,
          title: e.nome_exame,
          date: e.data_upload,
          doctor: 'Anexo Próprio',
          specialty: 'Triagem / Comprovação',
          status: 'disponível',
          type: 'documento',
          arquivo: e.arquivo
        } as Exame));
        this.exames.set(mapped);
      },
      error: (err) => console.error('Erro ao buscar exames:', err)
    });
  }

  uploadExame(file: File, nome_exame: string) {
    const formData = new FormData();
    formData.append('arquivo', file);
    formData.append('nome_exame', nome_exame);

    return this.http.post<{message: string, caminho: string}>(`${this.apiUrl}/api/v1/exams/upload`, formData);
  }

  excluirExame(id: number): void {
    this.http.delete(`${this.apiUrl}/api/v1/exams/${id}`).subscribe({
      next: () => {
        this.exames.update(prev => prev.filter(e => e.id !== id));
      },
      error: (err) => console.error('Erro ao excluir exame:', err)
    });
  }

  getExameById(id: number): Exame | undefined {
    return this.exames().find(e => e.id === id);
  }
}
