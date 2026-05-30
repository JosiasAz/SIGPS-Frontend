import { Component, signal, inject, computed, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { filter } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';

import { forkJoin, of } from 'rxjs';

import { catchError } from 'rxjs/operators';

import { AbstractAuthService } from '../../services/auth/abstract-auth.service';

import { AbstractChatService } from '../../services/chat/abstract-chat.service';

import { AbstractNotificationsService } from '../../services/notifications/abstract-notifications.service';

import { AppRefreshService } from '../../services/app-refresh.service';

import { EspecialistasService } from '../../services/especialistas/especialistas.service';
import { PrefetchService } from '../../services/prefetch.service';

import { UserRole } from '../../models/auth.model';

import { environment } from '../../env/environment';



interface SearchResult {

  id: number;

  title: string;

  type: string;

  route: string;

  queryParams?: Record<string, string | number>;

}



@Component({

  selector: 'app-painel',

  standalone: true,

  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],

  templateUrl: './painel.html',

  styleUrl: './painel.scss',

})

export class Painel implements OnInit, OnDestroy {

  private authService = inject(AbstractAuthService);

  private chatService = inject(AbstractChatService);

  private notificationsService = inject(AbstractNotificationsService);

  private appRefresh = inject(AppRefreshService);

  private router = inject(Router);

  private http = inject(HttpClient);

  private especialistasService = inject(EspecialistasService);

  private prefetch = inject(PrefetchService);

  isSidebarCollapsed = signal(false);

  isMobileMenuOpen = signal(false);

  navigating = signal(false);



  currentUser = this.authService.currentUser;

  unreadMessages = this.chatService.unreadCount;



  userRole = this.authService.userRole;

  isAdmin = computed(() => this.authService.userRole() === 'admin');

  isPaciente = computed(() => this.authService.userRole() === 'paciente');



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

    { icon: 'calendar', label: 'Agendamentos', route: '/painel/agendas', roles: ['admin', 'gestor'] as UserRole[] },

    { icon: 'calendar', label: 'Meus Agendamentos', route: '/painel/agendas', roles: ['especialista', 'paciente'] as UserRole[] },

    { icon: 'users', label: 'Pacientes', route: '/painel/pacientes', roles: ['admin', 'gestor', 'especialista', 'visualizador'] as UserRole[] },

    { icon: 'activity', label: 'Especialistas', route: '/painel/especialistas', roles: ['admin', 'gestor'] as UserRole[] },

    { icon: 'building', label: 'Minha Clínica', route: '/painel/meu-perfil', queryParams: { aba: 'clinica' }, roles: ['gestor', 'especialista'] as UserRole[] },

    { icon: 'search', label: 'Explorar', route: '/painel/explorar-clinicas', roles: ['paciente'] as UserRole[] },

    { icon: 'list', label: 'Fila de Espera', route: '/painel/fila', roles: ['gestor', 'especialista', 'visualizador'] as UserRole[] },

    { icon: 'user', label: 'Meu Perfil', route: '/painel/meu-perfil', queryParams: { aba: 'conta' }, roles: ['gestor'] as UserRole[] },

    { icon: 'user', label: 'Meu Perfil', route: '/painel/meu-perfil', roles: ['admin', 'especialista', 'visualizador', 'paciente'] as UserRole[] },

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

  isExplorarActive(): boolean {
    const url = this.router.url;
    return url.includes('/explorar-clinicas') || url.includes('/busca-profissionais');
  }

  preloadRoute(route: string): void {
    this.prefetch.preloadRoute(route);
  }

  ngOnInit(): void {
    this.prefetch.warmPainel();
    this.router.events.pipe(
      filter(e =>
        e instanceof NavigationStart ||
        e instanceof NavigationEnd ||
        e instanceof NavigationCancel ||
        e instanceof NavigationError
      )
    ).subscribe(e => {
      this.navigating.set(e instanceof NavigationStart);
    });
  }

  toggleMobileMenu() {

    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());

  }



  closeMobileMenu() {

    this.isMobileMenuOpen.set(false);

  }



  organizations = this.authService.organizations;

  activeOrganizationId = this.authService.activeOrganizationId;



  onOrganizationChange(orgIdVal: string) {

    const orgId = parseInt(orgIdVal);

    if (!isNaN(orgId)) {

      this.authService.setActiveOrganization(orgId);

      this.appRefresh.onOrganizationChanged();

    }

  }



  onLogout() {

    this.authService.logout();

    this.router.navigate(['/login']);

  }



  isSearchActive = false;

  searchResults = signal<SearchResult[]>([]);

  private searchTimer?: ReturnType<typeof setTimeout>;



  onSearch(query: string) {

    if (this.searchTimer) clearTimeout(this.searchTimer);



    if (!query.trim()) {

      this.searchResults.set([]);

      return;

    }



    this.searchTimer = setTimeout(() => this.executarBusca(query.trim()), 300);

  }



  private executarBusca(query: string) {

    const lowerQuery = query.toLowerCase();

    const role = this.authService.userRole();

    const podeBuscarPacientes = ['admin', 'gestor', 'especialista', 'visualizador'].includes(role || '');

    const profissionais$ = this.especialistasService.buscarProfissionais({ nome: query }).pipe(catchError(() => of([])));

    const pacientes$ = podeBuscarPacientes

      ? this.http.get<Array<{ id: number; nome: string; cpf?: string }>>(

          `${environment.apiUrl}/api/v1/patients/?nome=${encodeURIComponent(query)}`

        ).pipe(catchError(() => of([])))

      : of([]);



    forkJoin({ profissionais: profissionais$, pacientes: pacientes$ }).subscribe(({ profissionais, pacientes }) => {

      const results: SearchResult[] = [];



      const nomesProfissionais = new Set(
        profissionais.map(p => p.nome.toLowerCase().trim())
      );

      for (const p of pacientes.slice(0, 5)) {
        if (nomesProfissionais.has(p.nome.toLowerCase().trim())) continue;

        results.push({

          id: p.id,

          title: p.nome,

          type: 'Paciente',

          route: '/painel/pacientes',

        });

      }



      for (const pro of profissionais.slice(0, 5)) {

        results.push({

          id: pro.id + 10000,

          title: pro.nome,

          type: `Profissional · ${pro.especialidade}`,

          route: '/painel/perfil-profissional/' + pro.id,

        });

      }



      this.especialistasService.loadEspecialidades();

      const especialidades = this.especialistasService.especialidadesDisponiveis().filter(e => e !== 'Todas');

      for (const esp of especialidades) {

        if (esp.toLowerCase().includes(lowerQuery)) {

          results.push({

            id: esp.length + 20000,

            title: esp,

            type: 'Especialidade',

            route: '/painel/busca-profissionais',

            queryParams: { especialidade: esp },

          });

        }

      }



      if (lowerQuery.includes('profission')) {

        results.push({

          id: 30001,

          title: 'Explorar profissionais',

          type: 'Busca',

          route: '/painel/busca-profissionais',

        });

      }



      this.searchResults.set(results.slice(0, 10));

    });

  }



  onSearchBlur() {

    setTimeout(() => {

      this.isSearchActive = false;

    }, 200);

  }



  goToResult(result: SearchResult) {

    if (result.queryParams) {

      this.router.navigate([result.route], { queryParams: result.queryParams });

    } else {

      this.router.navigate([result.route]);

    }

    this.isSearchActive = false;

  }



  isNotificationsOpen = signal(false);



  chatNotifications = computed(() => {

    const convs = this.chatService.conversations();

    return convs

      .filter(c => c.unreadCount > 0)

      .slice(0, 3)

      .map((c, i) => ({

        id: 2000 + i,

        message: `Nova mensagem de: ${c.userName}`,

        time: c.lastMessageTime,

        route: '/painel/chat',

        queryParams: { with: c.userId },

        read: false

      }));

  });



  notifications = computed(() => {

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



  clickNotification(notif: { id: number; read?: boolean; route: string; queryParams?: Record<string, string | number> }) {

    if (!notif.read) {

      if (notif.id < 2000) {

        this.notificationsService.markAsRead(notif.id);

      }

    }

    if (notif.queryParams) {

      this.router.navigate([notif.route], { queryParams: notif.queryParams });

    } else {

      this.goToResult({ id: notif.id, title: '', type: '', route: notif.route });

    }

    this.isNotificationsOpen.set(false);

  }



  markAllAsRead() {

    this.notificationsService.markAllAsRead();

  }



  ngOnDestroy() {

    if (this.searchTimer) clearTimeout(this.searchTimer);

  }

}

