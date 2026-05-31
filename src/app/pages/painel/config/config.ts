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

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './config.html',
  styleUrls: ['./config.scss'],
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

  loadUsers() {
    this.isLoadingUsers.set(true);
    this.http.get<UserData[]>(`${environment.apiUrl}/api/v1/admin/users`).subscribe({
      next: (data) => {
        const filtered = data.filter(u => u.perfil !== 'Admin');
        this.users.set(filtered);
        this.isLoadingUsers.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar usuários:', err);
        this.isLoadingUsers.set(false);
      }
    });
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

  deleteUser(userId: number) {
    const current = this.currentUser();
    if (current && current.id === userId) {
      alert('Por questões de segurança, você não pode excluir a sua própria conta de administrador.');
      return;
    }

    if (confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita e removerá todos os dados associados.')) {
      this.http.delete(`${environment.apiUrl}/api/v1/admin/users/${userId}`).subscribe({
        next: () => {
          this.users.update(currentList => currentList.filter(u => u.id !== userId));
          alert('Usuário excluído com sucesso!');
        },
        error: (err) => {
          console.error('Erro ao excluir usuário:', err);
          alert(err.error?.message || 'Erro ao excluir o usuário. Verifique o console.');
        }
      });
    }
  }

  toggleSetting(label: string): void {
    this.configService.toggleSetting(label);
  }
}
