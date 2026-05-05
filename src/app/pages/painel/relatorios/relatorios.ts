import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractRelatoriosService } from '../../../services/relatorios/abstract-relatorios.service';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './relatorios.html',
  styleUrls: ['../painel.scss'],
})
export class RelatoriosComponent {
  private relatoriosService = inject(AbstractRelatoriosService);
  kpis = this.relatoriosService.kpis();

  exportarPDF(): void {
    alert('Relatório PDF gerado e baixado com sucesso! (Funcionalidade simulada)');
  }
}
