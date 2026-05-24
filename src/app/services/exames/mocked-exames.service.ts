import { Injectable, signal, computed } from '@angular/core';
import { AbstractExamesService, Exame } from './abstract-exames.service';

@Injectable({ providedIn: 'root' })
export class MockedExamesService implements AbstractExamesService {
  exames = signal<Exame[]>([
    { id: 1, title: 'Hemograma Completo', date: '10/11/2026', doctor: 'Dra. Luiza Souza', status: 'Disponível', type: 'Sangue' },
    { id: 2, title: 'Raio-X do Tórax', date: '05/10/2026', doctor: 'Dr. Roberto Lins', status: 'Disponível', type: 'Imagem' },
    { id: 3, title: 'Eletrocardiograma (ECG)', date: '15/09/2026', doctor: 'Dr. Carlos Renato', status: 'Disponível', type: 'Exame' },
  ]);

  examesCount = computed(() => this.exames().length);

  excluirExame(id: number): void {
    this.exames.update(prev => prev.filter(e => e.id !== id));
  }

  getExameById(id: number): Exame | undefined {
    return this.exames().find(e => e.id === id);
  }
}
