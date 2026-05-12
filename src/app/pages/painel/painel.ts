import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AbstractAuthService } from '../../services/auth/abstract-auth.service';
import { AbstractChatService } from '../../services/chat/abstract-chat.service';
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
  private chatService = inject(AbstractChatService);
  private router = inject(Router);

  isSidebarCollapsed = signal(false);

  currentUser = this.authService.currentUser;
  unreadMessages = this.chatService.unreadCount;

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
    { icon: 'grid', label: 'Dashboard', route: '/painel/dashboard', roles: ['admin', 'gestor', 'especialista', 'visualizador'] as UserRole[] },
    { icon: 'grid', label: 'Meu Portal', route: '/painel/portal-paciente', roles: ['paciente'] as UserRole[] },
    { icon: 'calendar', label: 'Meus Agendamentos', route: '/painel/agendas', roles: ['paciente'] as UserRole[] },
    { icon: 'users', label: 'Pacientes', route: '/painel/pacientes', roles: ['admin', 'gestor', 'especialista', 'visualizador'] as UserRole[] },
    { icon: 'calendar', label: 'Agendas', route: '/painel/agendas', roles: ['admin', 'gestor', 'especialista'] as UserRole[] },
    { icon: 'activity', label: 'Especialistas', route: '/painel/especialistas', roles: ['admin', 'gestor'] as UserRole[] },
    { icon: 'list', label: 'Fila de Espera', route: '/painel/fila', roles: ['admin', 'gestor', 'especialista', 'visualizador'] as UserRole[] },
    { icon: 'activity', label: 'Gestão por IA', route: '/painel/gestao-ia', roles: ['admin', 'gestor', 'especialista'] as UserRole[] },
    { icon: 'user', label: 'Meu Perfil', route: '/painel/meu-perfil', roles: ['admin', 'gestor', 'especialista', 'visualizador', 'paciente'] as UserRole[] },
    { icon: 'message-square', label: 'Chat e Mensagens', route: '/painel/chat', roles: ['admin', 'gestor', 'especialista', 'visualizador', 'paciente'] as UserRole[] },
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
    this.router.navigate(['/login']);
  }

  // SEARCH FUNCTIONALITY
  isSearchActive = false;
  searchResults = signal<{id: number, title: string, type: string, route: string}[]>([]);

  onSearch(query: string) {
    if (!query) {
      this.searchResults.set([]);
      return;
    }
    const lowerQuery = query.toLowerCase();
    
    // Fake database
    const allMocks = [
      { id: 1, title: 'Carlos da Silva', type: 'Paciente', route: '/painel/pacientes' },
      { id: 2, title: 'Cardiologia', type: 'Especialidade', route: '/painel/agendas' },
      { id: 3, title: 'Dr. Roberto Lins', type: 'Médico', route: '/painel/especialistas' },
      { id: 4, title: 'Raio-X tórax', type: 'Exame', route: '/painel/exames' },
      { id: 5, title: 'Atendimento e Chat', type: 'Setor', route: '/painel/chat' },
      { id: 6, title: 'Fila de Consultas', type: 'Recepção', route: '/painel/fila' },
    ];
    
    this.searchResults.set(allMocks.filter(m => 
      m.title.toLowerCase().includes(lowerQuery) || 
      m.type.toLowerCase().includes(lowerQuery)
    ));
  }

  onSearchBlur() {
    setTimeout(() => {
      this.isSearchActive = false;
    }, 200); // 200ms delay enables user to actually click elements before the DOM destroys it
  }

  goToResult(route: string) {
    this.router.navigate([route]);
    this.isSearchActive = false;
  }

  // NOTIFICATION FUNCTIONALITY
  isNotificationsOpen = signal(false);
  readNotificationIds = signal<number[]>([]);

  chatNotifications = computed(() => {
    // Notificações baseadas em conversas com mensagens não lidas
    const convs = this.chatService.conversations();
    return convs
      .filter(c => c.unreadCount > 0)
      .slice(0, 3)
      .map((c, i) => ({
        id: 2000 + i,
        message: `Nova mensagem de: ${c.userName}`,
        time: c.lastMessageTime,
        route: '/painel/chat',
        read: false
      }));
  });

  notifications = computed(() => {
    const role = this.authService.userRole();
    const readIds = this.readNotificationIds();
    
    const baseNotifs = role === 'paciente' ? [
        { id: 2, message: 'Seu Exame Raio-X Tórax está Disponível', time: 'Há 2h', route: '/painel/exames', read: readIds.includes(2) },
        { id: 3, message: 'Consulta com Dr. Silva confirmada', time: 'Ontem', route: '/painel/agendas', read: readIds.includes(3) }
    ] : [
        { id: 1, message: 'Novo agendamento: Paciente Carlos (Hoje às 14:00)', time: 'Agora', route: '/painel/agendas', read: readIds.includes(1) }
    ];

    return [...this.chatNotifications(), ...baseNotifs];
  });

  unreadNotifications = computed(() => this.notifications().filter(n => !n.read).length);

  toggleNotifications() {
    this.isNotificationsOpen.set(!this.isNotificationsOpen());
  }

  onNotificationBlur() {
    setTimeout(() => {
      this.isNotificationsOpen.set(false);
    }, 200);
  }

  markAllAsRead() {
    this.chatService.markAsRead();
    const unreadIds = this.notifications()
      .filter(n => !n.read)
      .map(n => n.id);
    this.readNotificationIds.update(ids => [...ids, ...unreadIds]);
  }
}
