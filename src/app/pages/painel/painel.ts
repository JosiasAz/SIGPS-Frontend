import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AbstractAuthService } from '../../services/auth/abstract-auth.service';
import { UserRole } from '../../models/auth.model';

@Component({
  selector: 'app-painel',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './painel.html',
  styleUrl: './painel.scss',
})
export class Painel {
  private authService = inject(AbstractAuthService);

  isSidebarCollapsed = signal(false);

  currentUser = this.authService.currentUser;

  userRoleLabel = computed(() => {
    const role = this.authService.userRole();
    const labels: Record<string, string> = {
      'admin': 'Administrador',
      'gestor': 'Gestor Clínico',
      'especialista': 'Especialista',
      'visualizador': 'Visualizador',
      'paciente': 'Paciente'
    };
    return role ? labels[role] : 'Usuário';
  });

  private allMenuItems = [
    { icon: 'grid', label: 'Dashboard', route: '/painel/dashboard', roles: ['admin', 'gestor', 'especialista', 'visualizador', 'paciente'] as UserRole[] },
    { icon: 'calendar', label: 'Meus Agendamentos', route: '/painel/agendas', roles: ['paciente'] as UserRole[] },
    { icon: 'users', label: 'Pacientes', route: '/painel/pacientes', roles: ['admin', 'gestor', 'especialista', 'visualizador'] as UserRole[] },
    { icon: 'calendar', label: 'Agendas', route: '/painel/agendas', roles: ['admin', 'gestor', 'especialista'] as UserRole[] },
    { icon: 'activity', label: 'Especialistas', route: '/painel/especialistas', roles: ['admin', 'gestor'] as UserRole[] },
    { icon: 'list', label: 'Fila de Espera', route: '/painel/fila', roles: ['admin', 'gestor', 'especialista', 'visualizador'] as UserRole[] },
    { icon: 'pie-chart', label: 'Relatórios', route: '/painel/relatorios', roles: ['admin', 'gestor'] as UserRole[] },
    { icon: 'settings', label: 'Configurações', route: '/painel/config', roles: ['admin'] as UserRole[] },
  ];

  menuItems = computed(() => {
    return this.allMenuItems.filter(item => this.authService.hasRole(item.roles));
  });

  toggleSidebar() {
    this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
  }

  onLogout() {
    this.authService.logout();
  }
}
