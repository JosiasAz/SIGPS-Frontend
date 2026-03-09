import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractPacientesService } from '../../../services/pacientes/abstract-pacientes.service';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pacientes.html',
  styleUrls: ['../painel.scss'],
})
export class PacientesComponent {
  private pacientesService = inject(AbstractPacientesService);
  pacientes = this.pacientesService.pacientes();
}
