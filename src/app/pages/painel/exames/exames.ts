import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AbstractExamesService, Exame } from '../../../services/exames/abstract-exames.service';
import { AbstractAuthService } from '../../../services/auth/abstract-auth.service';

@Component({
  selector: 'app-exames',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './exames.html',
  styleUrls: ['../painel.scss', './exames.scss']
})
export class ExamesComponent {
  private examesService = inject(AbstractExamesService);
  private authService = inject(AbstractAuthService);
  exames = this.examesService.exames;

  currentExame = signal<Exame | null>(null);

  isGestor = computed(() => {
    const role = this.authService.userRole();
    return role === 'admin' || role === 'gestor';
  });

  visualizarExame(exame: Exame) {
    this.currentExame.set(exame);
  }

  fecharModal() {
    this.currentExame.set(null);
  }

  baixarPdf(exame: Exame) {
    // Mock download
    alert(`Iniciando download do laudo: ${exame.title}_${exame.date.replace(/\//g, '-')}.pdf`);
  }

  excluirExame(id: number, event: Event) {
    event.stopPropagation();
    if (confirm('Tem certeza que deseja remover este registro de exame?')) {
      this.examesService.excluirExame(id);
    }
  }
}
