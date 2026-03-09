import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractEspecialistasService } from '../../../services/especialistas/abstract-especialistas.service';

@Component({
  selector: 'app-especialistas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './especialistas.html',
  styleUrls: ['../painel.scss'],
})
export class EspecialistasComponent {
  private especialistasService = inject(AbstractEspecialistasService);
  especialistas = this.especialistasService.especialistas();
}
