import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../env/environment';
import { AbstractConfigService } from '../../../services/config/abstract-config.service';
import { AbstractAuthService } from '../../../services/auth/abstract-auth.service';

interface UserData {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

interface UsersPageResponse {
  items: UserData[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

interface VerificacaoPendente {
  userId: number;
  nome: string;
  email: string;
  especialidade: string;
  crm: string;
  statusVerificacao: string;
  documentoEnviado: boolean;
  documentoDisponivel?: boolean;
}

interface ProfissionalApi {
  id: number;
  nome: string;
  especialidade?: string;
  crm?: string;
  statusVerificacao?: string;
}

type ModalType = 'confirm' | 'success' | 'error' | 'info';

interface AppModalState {
  visible: boolean;
  type: ModalType;
  title: string;
  message: string;
  user?: UserData;
  pending?: boolean;
}

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './config.html',
  styleUrls: ['../painel.scss', './config.scss'],
})
export class ConfigComponent implements OnInit {
  private configService = inject(AbstractConfigService);
  private authService = inject(AbstractAuthService);
  private http = inject(HttpClient);

  currentUser = this.authService.currentUser;

  settings = this.configService.settings();
  users = signal<UserData[]>([]);
  verificacoes = signal<VerificacaoPendente[]>([]);
  isLoadingUsers = signal(true);
  isLoadingVerificacoes = signal(true);
  erroVerificacoes = signal<string | null>(null);
  modal = signal<AppModalState>({ visible: false, type: 'info', title: '', message: '' });
  private pendingDeleteUserId = signal<number | null>(null);

  currentPage = signal(1);
  perPage = signal(15);
  totalUsers = signal(0);
  totalPages = signal(1);
  userSearch = signal('');
  private userSearchTimeout: ReturnType<typeof setTimeout> | null = null;

  private readonly urlsListagem = [
    `${environment.apiUrl}/api/v1/admin/verificacoes-pendentes`,
    `${environment.apiUrl}/api/v1/perfil/verificacoes-pendentes`,
  ];

  ngOnInit() {
    this.loadUsers();
    this.loadVerificacoes();
  }

  loadVerificacoes() {
    this.isLoadingVerificacoes.set(true);
    this.erroVerificacoes.set(null);
    this.tentarCarregarVerificacoes(0);
  }

  private tentarCarregarVerificacoes(indice: number) {
    if (indice >= this.urlsListagem.length) {
      this.carregarVerificacoesViaSpecialists();
      return;
    }

    this.http.get<VerificacaoPendente[]>(this.urlsListagem[indice]).subscribe({
      next: (data) => {
        this.verificacoes.set(data);
        this.isLoadingVerificacoes.set(false);
      },
      error: (err) => {
        if (err.status === 404 && indice + 1 < this.urlsListagem.length) {
          this.tentarCarregarVerificacoes(indice + 1);
          return;
        }
        if (err.status === 404) {
          this.carregarVerificacoesViaSpecialists();
          return;
        }
        console.error('Erro ao carregar verificações:', err);
        this.erroVerificacoes.set(err.error?.message || 'Não foi possível carregar as verificações pendentes.');
        this.isLoadingVerificacoes.set(false);
      }
    });
  }

  private carregarVerificacoesViaSpecialists() {
    this.http.get<ProfissionalApi[]>(`${environment.apiUrl}/api/v1/specialists/?verificados=false`).subscribe({
      next: (profissionais) => {
        const pendentes = profissionais
          .filter(p => p.statusVerificacao === 'em_analise' || p.statusVerificacao === 'rejeitado')
          .map(p => ({
            userId: p.id,
            nome: p.nome,
            email: '',
            especialidade: p.especialidade || '',
            crm: p.crm || '',
            statusVerificacao: p.statusVerificacao || 'em_analise',
            documentoEnviado: true,
            documentoDisponivel: undefined,
          }));
        this.verificacoes.set(pendentes);
        if (pendentes.length === 0) {
          this.erroVerificacoes.set(
            'Nenhuma verificação encontrada. Atualize o backend em produção (api.sigps.online) para ver documentos enviados.'
          );
        }
        this.isLoadingVerificacoes.set(false);
      },
      error: () => {
        this.erroVerificacoes.set(
          'A API de verificação ainda não está disponível no servidor. Faça deploy do backend atualizado ou use o ambiente local (localhost:5000).'
        );
        this.isLoadingVerificacoes.set(false);
      }
    });
  }

  atualizarVerificacao(userId: number, status: string) {
    const urls = [
      `${environment.apiUrl}/api/v1/admin/verificacao/${userId}`,
      `${environment.apiUrl}/api/v1/perfil/verificacao/${userId}`,
    ];
    this.http.patch(urls[0], { status }).subscribe({
      next: () => {
        this.loadVerificacoes();
        alert('Status de verificação atualizado.');
      },
      error: (err) => {
        if (err.status === 404) {
          this.http.patch(urls[1], { status }).subscribe({
            next: () => {
              this.loadVerificacoes();
              alert('Status de verificação atualizado.');
            },
            error: (e2) => {
              console.error('Erro ao atualizar verificação:', e2);
              alert(e2.error?.message || 'Erro ao atualizar verificação.');
            }
          });
          return;
        }
        console.error('Erro ao atualizar verificação:', err);
        alert(err.error?.message || 'Erro ao atualizar verificação.');
      }
    });
  }

  baixarDocumento(userId: number) {
    const urls = [
      `${environment.apiUrl}/api/v1/admin/verificacao/${userId}/documento`,
      `${environment.apiUrl}/api/v1/perfil/documento/${userId}`,
    ];
    this.baixarDeUrl(urls, 0);
  }

  private baixarDeUrl(urls: string[], indice: number) {
    this.http.get(urls[indice], { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      },
      error: (err) => {
        if (err.status === 404 && indice + 1 < urls.length) {
          this.baixarDeUrl(urls, indice + 1);
          return;
        }
        console.error('Erro ao baixar documento:', err);
        alert(err.error?.message || 'Não foi possível abrir o documento.');
      }
    });
  }

  labelVerificacao(status: string): string {
    const labels: Record<string, string> = {
      nao_verificado: 'Não verificado',
      em_analise: 'Em análise',
      verificado: 'Verificado',
      rejeitado: 'Rejeitado',
    };
    return labels[status] || status;
  }

  loadUsers(page = this.currentPage()) {
    this.isLoadingUsers.set(true);

    const params: Record<string, string | number> = {
      page,
      per_page: this.perPage(),
    };
    const search = this.userSearch().trim();
    if (search) params['q'] = search;

    this.http.get<UsersPageResponse>(`${environment.apiUrl}/api/v1/admin/users`, { params }).subscribe({
      next: (data) => {
        this.users.set(data.items);
        this.currentPage.set(data.page);
        this.totalUsers.set(data.total);
        this.totalPages.set(data.total_pages);
        this.isLoadingUsers.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar usuários:', err);
        this.isLoadingUsers.set(false);
      },
    });
  }

  onUserSearchInput(value: string) {
    this.userSearch.set(value);
    if (this.userSearchTimeout) clearTimeout(this.userSearchTimeout);
    this.userSearchTimeout = setTimeout(() => this.loadUsers(1), 350);
  }

  clearUserSearch() {
    this.userSearch.set('');
    this.loadUsers(1);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.loadUsers(page);
  }

  changePerPage(value: number) {
    this.perPage.set(value);
    this.loadUsers(1);
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

  usersRangeLabel(): string {
    const total = this.totalUsers();
    if (total === 0) return 'Nenhum usuário encontrado';
    const start = (this.currentPage() - 1) * this.perPage() + 1;
    const end = Math.min(this.currentPage() * this.perPage(), total);
    return `Exibindo ${start}–${end} de ${total} usuários`;
  }

  changeUserRole(userId: number, novoPerfil: string) {
    const current = this.currentUser();
    if (current && current.id === userId) {
      alert('Por questões de segurança, você não pode alterar a sua própria função de acesso de administrador.');
      this.loadUsers();
      return;
    }

    this.http.patch(`${environment.apiUrl}/api/v1/admin/users/${userId}/role`, { perfil: novoPerfil }).subscribe({
      next: () => {
        this.users.update(currentList =>
          currentList.map(u => u.id === userId ? { ...u, perfil: novoPerfil } : u)
        );
        alert('Perfil atualizado com sucesso!');
      },
      error: (err) => {
        console.error('Erro ao atualizar perfil:', err);
        alert(err.error?.message || 'Erro ao atualizar o perfil. Verifique o console.');
        this.loadUsers();
      }
    });
  }

  openDeleteConfirm(user: UserData) {
    const current = this.currentUser();
    if (current && current.id === user.id) {
      this.showModal(
        'info',
        'Ação não permitida',
        'Por questões de segurança, você não pode excluir a sua própria conta de administrador.'
      );
      return;
    }

    this.pendingDeleteUserId.set(user.id);
    this.modal.set({
      visible: true,
      type: 'confirm',
      title: 'Excluir usuário?',
      message: 'Esta ação não pode ser desfeita e removerá todos os dados associados a esta conta.',
      user,
    });
  }

  confirmDeleteUser() {
    const userId = this.pendingDeleteUserId();
    if (!userId || this.modal().pending) return;

    this.modal.update(state => ({ ...state, pending: true }));

    this.http.delete(`${environment.apiUrl}/api/v1/admin/users/${userId}`).subscribe({
      next: () => {
        this.pendingDeleteUserId.set(null);
        const remaining = this.totalUsers() - 1;
        const lastPage = Math.max(1, Math.ceil(remaining / this.perPage()));
        const page = this.currentPage() > lastPage ? lastPage : this.currentPage();
        this.loadUsers(page);
        this.modal.set({
          visible: true,
          type: 'success',
          title: 'Usuário excluído',
          message: 'O usuário foi removido da plataforma com sucesso.',
        });
      },
      error: (err) => {
        console.error('Erro ao excluir usuário:', err);
        this.pendingDeleteUserId.set(null);
        this.modal.set({
          visible: true,
          type: 'error',
          title: 'Não foi possível excluir',
          message: err.error?.message || 'Erro ao excluir o usuário. Tente novamente.',
        });
      },
    });
  }

  closeModal() {
    if (this.modal().pending) return;
    this.modal.update(state => ({ ...state, visible: false }));
    this.pendingDeleteUserId.set(null);
  }

  private showModal(type: ModalType, title: string, message: string) {
    this.modal.set({ visible: true, type, title, message });
  }

  toggleSetting(label: string): void {
    this.configService.toggleSetting(label);
  }
}

