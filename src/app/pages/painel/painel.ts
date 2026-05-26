import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AbstractAuthService } from '../../services/auth/abstract-auth.service';
import { AbstractChatService } from '../../services/chat/abstract-chat.service';
import { AbstractNotificationsService } from '../../services/notifications/abstract-notifications.service';
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
  private notificationsService = inject(AbstractNotificationsService);
  private router = inject(Router);

  isSidebarCollapsed = signal(false);
  isMobileMenuOpen = signal(false);

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
    { icon: 'user', label: 'Meu Perfil', route: '/painel/meu-perfil', roles: ['admin', 'gestor', 'especialista', 'visualizador', 'paciente'] as UserRole[] },
    { icon: 'message-square', label: 'Chat e Mensagens', route: '/painel/chat', roles: ['admin', 'gestor', 'especialista', 'visualizador', 'paciente'] as UserRole[] },
    { icon: 'pie-chart', label: 'Relatórios', route: '/painel/relatorios', roles: ['admin', 'gestor'] as UserRole[] },
    { icon: 'settings', label: 'Configurações', route: '/painel/config', roles: ['admin'] as UserRole[] },
    { icon: 'book-open', label: 'Documentação', route: '/painel/documentacao', roles: ['admin', 'gestor', 'especialista', 'visualizador', 'paciente'] as UserRole[] },
  ];

  menuItems = computed(() => {
    return this.allMenuItems.filter(item => this.authService.hasRole(item.roles));
  });

  toggleSidebar() {
    this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
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
    // Carrega as notificações em tempo real sempre que o menu abrir
    if (this.isNotificationsOpen()) {
      this.notificationsService.loadNotifications();
    }
    return [...this.chatNotifications(), ...this.notificationsService.notifications()];
  });

  unreadNotifications = computed(() => this.chatNotifications().length + this.notificationsService.unreadCount());

  toggleNotifications() {
    const nextState = !this.isNotificationsOpen();
    this.isNotificationsOpen.set(nextState);
    if (nextState) {
      this.notificationsService.loadNotifications();
    }
  }

  onNotificationBlur() {
    setTimeout(() => {
      this.isNotificationsOpen.set(false);
    }, 200);
  }

  clickNotification(notif: any) {
    if (!notif.read) {
      if (notif.id < 2000) {
        this.notificationsService.markAsRead(notif.id);
      }
    }
    this.goToResult(notif.route);
  }

  markAllAsRead() {
    this.chatService.markAsRead();
    this.notificationsService.markAllAsRead();
  }
}
