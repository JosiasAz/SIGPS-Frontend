import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractFilaService } from '../../../services/fila/abstract-fila.service';

@Component({
  selector: 'app-gestao-ia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestao-ia.html',
  styleUrls: ['../painel.scss', './gestao-ia.scss']
})
export class GestaoIAComponent implements OnInit {
  private filaService = inject(AbstractFilaService);

  fila = this.filaService.fila;
  analiseIA = this.filaService.analiseIA;

  altaPrioridade = computed(() => {
    return this.fila().filter(p => p.prioridade === 'Extrema' || p.prioridade === 'Alta').length;
  });

  ngOnInit() {
    this.filaService.refreshFila();
    this.filaService.analisarIA();
  }

  reordenar() {
    this.filaService.reordenarFila();
  }

  atender(item: { id: string; paciente: string }) {
    if (confirm(`Confirmar atendimento de ${item.paciente}?`)) {
      this.filaService.atenderPaciente(item.id, item.paciente);
    }
  }
}
