import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractAgendasService } from '../../../services/agendas/abstract-agendas.service';

@Component({
  selector: 'app-agendas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agendas.html',
  styleUrls: ['../painel.scss'],
})
export class AgendasComponent {
  private agendasService = inject(AbstractAgendasService);
  agendas = this.agendasService.agendas();
}
