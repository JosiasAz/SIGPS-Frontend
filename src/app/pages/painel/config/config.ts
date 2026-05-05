import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../env/environment';
import { AbstractConfigService } from '../../../services/config/abstract-config.service';

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
  styleUrls: ['../painel.scss'],
})
export class ConfigComponent implements OnInit {
  private configService = inject(AbstractConfigService);
  private http = inject(HttpClient);
  
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
        this.users.set(data);
        this.isLoadingUsers.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar usuários:', err);
        this.isLoadingUsers.set(false);
      }
    });
  }

  changeUserRole(userId: number, novoPerfil: string) {
    this.http.patch(`${environment.apiUrl}/api/v1/admin/users/${userId}/role`, { perfil: novoPerfil }).subscribe({
      next: () => {
        // Atualiza a tabela localmente
        this.users.update(current => 
          current.map(u => u.id === userId ? { ...u, perfil: novoPerfil } : u)
        );
        alert('Perfil atualizado com sucesso!');
      },
      error: (err) => {
        console.error('Erro ao atualizar perfil:', err);
        alert('Erro ao atualizar o perfil. Verifique o console.');
        // Reverte em caso de erro recarregando
        this.loadUsers();
      }
    });
  }

  toggleSetting(label: string): void {
    this.configService.toggleSetting(label);
  }
}

