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
  isLoadingUsers = signal(true);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoadingUsers.set(true);
    this.http.get<UserData[]>(`${environment.apiUrl}/api/v1/admin/users`).subscribe({
      next: (data) => {
        // Não exibe usuários com perfil 'Admin' na listagem
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
      this.loadUsers(); // Reverte a seleção no dropdown
      return;
    }

    this.http.patch(`${environment.apiUrl}/api/v1/admin/users/${userId}/role`, { perfil: novoPerfil }).subscribe({
      next: () => {
        // Atualiza a tabela localmente
        this.users.update(currentList => 
          currentList.map(u => u.id === userId ? { ...u, perfil: novoPerfil } : u)
        );
        alert('Perfil atualizado com sucesso!');
      },
      error: (err) => {
        console.error('Erro ao atualizar perfil:', err);
        alert(err.error?.message || 'Erro ao atualizar o perfil. Verifique o console.');
        // Reverte em caso de erro recarregando
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

