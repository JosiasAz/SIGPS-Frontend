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

  // --- LOGICA DE UPLOAD ---
  uploading = signal(false);
  fileToUpload = signal<File | null>(null);
  nomeExame = signal<string>('');
  showUploadModal = signal(false);

  openUploadModal() {
    this.showUploadModal.set(true);
  }

  closeUploadModal() {
    this.showUploadModal.set(false);
    this.fileToUpload.set(null);
    this.nomeExame.set('');
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileToUpload.set(input.files[0]);
    }
  }

  onNomeChange(event: Event) {
    this.nomeExame.set((event.target as HTMLInputElement).value);
  }

  enviarExame() {
    const file = this.fileToUpload();
    if (!file) return;

    this.uploading.set(true);
    // Any is used because we don't know the exact service implementation in runtime (mock vs real)
    const service: any = this.examesService;
    
    if (service.uploadExame) {
      service.uploadExame(file, this.nomeExame() || file.name).subscribe({
        next: () => {
          this.uploading.set(false);
          this.closeUploadModal();
          // reload if possible
          if (service.loadExames) service.loadExames();
          alert('Exame/Comprovante enviado com sucesso!');
        },
        error: (err: any) => {
          this.uploading.set(false);
          alert('Erro ao enviar exame: ' + (err.error?.message || err.message));
        }
      });
    } else {
      this.uploading.set(false);
      alert('Upload não suportado neste ambiente (Mock).');
    }
  }
}
