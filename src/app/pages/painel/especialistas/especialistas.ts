import { Component, inject, ViewChild, ElementRef, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, FormsModule } from '@angular/forms';
import { Profissional } from '../../../services/especialistas/abstract-especialistas.service';
import { EspecialistasService } from '../../../services/especialistas/especialistas.service';
import { AbstractAuthService } from '../../../services/auth/abstract-auth.service';

@Component({
  selector: 'app-especialistas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './especialistas.html',
  styleUrls: ['../painel.scss', './especialistas.scss'],
})
export class EspecialistasComponent implements OnInit {
  private especialistasService = inject(EspecialistasService);
  private authService = inject(AbstractAuthService);
  private fb = inject(FormBuilder);

  isAdmin = computed(() => this.authService.userRole() === 'admin');
  organizations = this.authService.organizations;
  activeOrganizationId = this.authService.activeOrganizationId;
  clinicaAtivaLabel = computed(() => {
    const orgId = this.activeOrganizationId();
    if (orgId === 0) return 'Todas as clínicas';
    return this.organizations().find(o => o.id === orgId)?.nome ?? 'Clínica selecionada';
  });

  especialistas = this.especialistasService.especialistas;
  currentPage = this.especialistasService.currentPage;
  totalPages = this.especialistasService.totalPages;
  totalEspecialistas = this.especialistasService.totalEspecialistas;
  perPage = this.especialistasService.perPage;
  isLoadingList = this.especialistasService.isLoadingList;
  userSearch = signal('');
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;
  especialistaForm: FormGroup;

  editingEspecialistaId: number | null = null;
  deletingEspecialistaId: number | null = null;
  deletingEspecialistaNome: string = '';

  readonly ufs = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
  readonly especialidades = [
    'Cardiologia', 'Dermatologia', 'Pediatria', 'Ortopedia', 
    'Psiquiatria', 'Ginecologia', 'Neurologia'
  ];

  constructor() {
    this.especialistaForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(5), Validators.pattern(/^[A-Za-zÀ-ÿ\s.]{5,}$/), this.nomeDuasPalavrasValidator]],
      crm: ['', [Validators.required, Validators.pattern(/^\d{4,6}-[A-Z]{2}$/), this.ufValidator.bind(this)]],
      especialidade: ['', Validators.required],
      situacao: ['Ativo', Validators.required]
    });

    // Formatar e capitalizar nome automaticamente
    this.especialistaForm.get('nome')?.valueChanges.subscribe(val => {
      if (val) {
        const formatado = this.capitalizeWords(val);
        if (formatado !== val) {
          this.especialistaForm.get('nome')?.setValue(formatado, { emitEvent: false });
        }
      }
    });

    // Formatar CRM e forçar uppercase
    this.especialistaForm.get('crm')?.valueChanges.subscribe(val => {
      if (val) {
        const formatado = this.formatarCrm(val);
        if (formatado !== val) {
          this.especialistaForm.get('crm')?.setValue(formatado, { emitEvent: false });
        }
      }
    });
  }

  ngOnInit() {
    this.loadPage(1);
  }

  loadPage(page: number) {
    this.especialistasService.loadEspecialistas({
      paginate: true,
      page,
      perPage: this.perPage(),
      nome: this.userSearch().trim() || undefined,
    });
  }

  onSearchInput(value: string) {
    this.userSearch.set(value);
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadPage(1), 350);
  }

  clearSearch() {
    this.userSearch.set('');
    this.loadPage(1);
  }

  changePerPage(value: number) {
    this.perPage.set(value);
    this.loadPage(1);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.loadPage(page);
  }

  paginationRange(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const maxButtons = 5;
    let start = Math.max(1, current - Math.floor(maxButtons / 2));
    let end = Math.min(total, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  rangeLabel(): string {
    const total = this.totalEspecialistas();
    if (total === 0) return 'Nenhum especialista encontrado';
    const start = (this.currentPage() - 1) * this.perPage() + 1;
    const end = Math.min(this.currentPage() * this.perPage(), total);
    return `Exibindo ${start}–${end} de ${total} especialistas`;
  }

  @ViewChild('addModal') addModal!: ElementRef<HTMLDialogElement>;
  @ViewChild('deleteModal') deleteModal!: ElementRef<HTMLDialogElement>;

  // Validator: Pelo menos 2 palavras com espaço
  private nomeDuasPalavrasValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const trimValue = control.value.trim();
    if (trimValue.indexOf(' ') === -1) {
      return { duasPalavras: true };
    }
    return null;
  }

  // Validator: UF deve ser válida
  private ufValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const parts = control.value.split('-');
    if (parts.length === 2) {
      const uf = parts[1].toUpperCase();
      if (uf.length === 2 && !this.ufs.includes(uf)) {
        return { ufInvalida: true };
      }
    }
    return null;
  }

  // Utility: Capitalizar cada palavra
  private capitalizeWords(text: string): string {
    return text.replace(/\b\w/g, char => char.toUpperCase());
  }

  // Utility: Formatar CRM
  private formatarCrm(text: string): string {
    // Permite números, hífen e letras (maiúsculas)
    let clean = text.toUpperCase().replace(/[^0-9A-Z-]/g, '');
    
    // Remove múltiplos hifens
    clean = clean.replace(/-+/g, '-');

    // Auto-inserir hífen se não houver e tiver mais que 6 números ou o usuário começar a digitar as letras
    if (!clean.includes('-')) {
        const numPart = clean.replace(/[^0-9]/g, '');
        const letterPart = clean.replace(/[^A-Z]/g, '');
        
        if (numPart.length >= 4 && letterPart.length > 0) {
            clean = `${numPart}-${letterPart.substring(0, 2)}`;
        } else if (clean.length > 6) {
             clean = `${clean.substring(0, 6)}-${clean.substring(6, 8)}`;
        }
    } else {
        // Garantir que a parte depois do hífen seja apenas letras e máx 2
        const parts = clean.split('-');
        if (parts.length > 1) {
            const numPart = parts[0].replace(/[^0-9]/g, '').substring(0, 6);
            const letterPart = parts[1].replace(/[^A-Z]/g, '').substring(0, 2);
            clean = `${numPart}-${letterPart}`;
            // Remove the hyphen if the number part is deleted
            if(numPart.length === 0) clean = '';
        }
    }
    return clean;
  }

  adicionarEspecialista(): void {
    this.editingEspecialistaId = null;
    this.especialistaForm.reset({ situacao: 'Ativo' });
    this.addModal.nativeElement.showModal();
  }

  editarEspecialista(esp: Profissional): void {
    this.editingEspecialistaId = esp.id!;
    this.especialistaForm.patchValue({
      nome: esp.nome,
      crm: esp.crm || esp.documento,
      especialidade: esp.especialidade,
      situacao: esp.situacao || 'Ativo'
    });
    this.addModal.nativeElement.showModal();
  }

  fecharModal(): void {
    this.addModal.nativeElement.close();
    this.editingEspecialistaId = null;
  }

  salvarEspecialista(): void {
    if (this.especialistaForm.valid) {
      const formValue = this.especialistaForm.value;
      
      const isEditing = this.editingEspecialistaId !== null;

      const payload: Partial<Profissional> = {
        nome: formValue.nome.trim(),
        crm: formValue.crm.toUpperCase(),
        uf: formValue.crm.split('-')[1]?.toUpperCase(),
        documento: formValue.crm.toUpperCase(),
        especialidade: formValue.especialidade,
        // situacao só é alterada quando o gestor edita explicitamente um profissional existente
        situacao: isEditing ? formValue.situacao : 'Ativo',
        last_seen: isEditing ? undefined : new Date().toISOString()
      };

      if (this.editingEspecialistaId !== null) {
        this.especialistasService.updateEspecialista(this.editingEspecialistaId, payload);
      } else {
        this.especialistasService.addEspecialista(payload);
      }
      this.fecharModal();
    } else {
      this.especialistaForm.markAllAsTouched();
    }
  }

  excluirEspecialista(id: number, nome: string): void {
    this.deletingEspecialistaId = id;
    this.deletingEspecialistaNome = nome;
    this.deleteModal.nativeElement.showModal();
  }

  fecharModalExclusao(): void {
    this.deleteModal.nativeElement.close();
    this.deletingEspecialistaId = null;
    this.deletingEspecialistaNome = '';
  }

  confirmarExclusao(): void {
    if (this.deletingEspecialistaId !== null) {
      this.especialistasService.removeEspecialista(this.deletingEspecialistaId);
      this.fecharModalExclusao();
    }
  }

  calcularStatusVisao(last_seen?: Date | string | null, statusDefault?: string): string {
    if (!last_seen) {
        // Fallback pro status antigo se não houver last_seen
        return statusDefault === 'online' ? 'Online' : 'Offline';
    }
    
    const lastSeenTime = new Date(last_seen).getTime();
    const now = new Date().getTime();
    const diffMinutes = (now - lastSeenTime) / (1000 * 60);

    // Considera Online se atividade foi há menos de 5 minutos
    return diffMinutes <= 5 ? 'Online' : 'Offline';
  }
}
