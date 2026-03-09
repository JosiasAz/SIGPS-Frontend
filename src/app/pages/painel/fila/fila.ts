import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractFilaService } from '../../../services/fila/abstract-fila.service';

@Component({
  selector: 'app-fila',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fila.html',
  styleUrls: ['../painel.scss'],
})
export class FilaComponent {
  private filaService = inject(AbstractFilaService);
  fila = this.filaService.fila();
}
