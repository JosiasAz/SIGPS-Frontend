import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractFilaService, PacienteFila } from '../../../services/fila/abstract-fila.service';

@Component({
  selector: 'app-gestao-ia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestao-ia.html',
  styleUrls: ['../painel.scss', './gestao-ia.scss']
})
export class GestaoIAComponent {
  private filaService = inject(AbstractFilaService);
  
  fila = this.filaService.fila;
  selectedId = signal<string | null>(null);

  selectedPaciente = computed(() => {
    const id = this.selectedId();
    if (!id) return null;
    return this.fila().find(p => p.id === id) || null;
  });

  altaPrioridade = computed(() => {
    return this.fila().filter(p => p.prioridade === 'Extrema' || p.prioridade === 'Alta').length;
  });

  reordenar() {
    this.filaService.reordenarFila();
    // Simula uma pequena demora de processamento da IA
    alert("Simulando processamento da Rede Neural SIGPS... Reordenando pacientes por risco clínico.");
  }

  atender(nome: string) {
    if (confirm(`Confirmar priorização de atendimento para ${nome}?`)) {
      this.filaService.atenderPaciente(nome);
    }
  }
}
