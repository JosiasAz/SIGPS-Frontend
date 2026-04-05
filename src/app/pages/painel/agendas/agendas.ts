import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractAgendasService } from '../../../services/agendas/abstract-agendas.service';

@Component({
  selector: 'app-agendas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agendas.html',
  styleUrls: ['../painel.scss', './agendas.scss'],
})
export class AgendasComponent {
  private agendasService = inject(AbstractAgendasService);
  agendas = this.agendasService.agendas();

  formatarHorarioSlot(h: string): string {
    const parts = h.split(':');
    if (parts.length === 2) {
      const hour = parseInt(parts[0], 10);
      const nextHour = (hour + 1).toString().padStart(2, '0');
      return `${h} até ${nextHour}:${parts[1]}`;
    }
    return h;
  }
}
