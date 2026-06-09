import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AbstractAuthService } from '../../services/auth/abstract-auth.service';
import { AppRefreshService } from '../../services/app-refresh.service';

@Component({
  selector: 'app-org-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './org-selector.component.html',
  styleUrl: './org-selector.component.scss',
})
export class OrgSelectorComponent {
  private authService = inject(AbstractAuthService);
  private appRefresh = inject(AppRefreshService);
  private host = inject(ElementRef<HTMLElement>);

  /** Exibe opção "Todas as clínicas" (id 0) — uso típico do admin. */
  showAllClinics = input(true);
  /** `header` = barra superior; `field` = formulário de filtros. */
  variant = input<'header' | 'field'>('header');

  organizations = this.authService.organizations;
  activeOrganizationId = this.authService.activeOrganizationId;

  isOpen = signal(false);
  search = signal('');

  filteredOrganizations = computed(() => {
    const query = this.search().trim().toLowerCase();
    const orgs = this.organizations();
    if (!query) return orgs;
    return orgs.filter(org => org.nome?.toLowerCase().includes(query));
  });

  selectedLabel = computed(() => {
    const id = this.activeOrganizationId();
    if (this.showAllClinics() && id === 0) return 'Todas as clínicas';
    const org = this.organizations().find(o => o.id === id);
    return org?.nome ?? 'Selecionar clínica';
  });

  isAllSelected = computed(() => this.showAllClinics() && this.activeOrganizationId() === 0);

  togglePanel(): void {
    this.isOpen.update(open => !open);
    if (!this.isOpen()) this.search.set('');
  }

  closePanel(): void {
    this.isOpen.set(false);
    this.search.set('');
  }

  selectOrganization(orgId: number): void {
    this.authService.setActiveOrganization(orgId);
    this.appRefresh.onOrganizationChanged();
    this.closePanel();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) return;
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.closePanel();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closePanel();
  }
}
