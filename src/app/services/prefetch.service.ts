import { Injectable, inject } from '@angular/core';

import { AbstractAuthService } from './auth/abstract-auth.service';

import { DashboardService } from './dashboard/dashboard.service';

import { AgendasService } from './agendas/agendas.service';

import { ExamesService } from './exames/exames.service';

import { EspecialistasService } from './especialistas/especialistas.service';

import { OrganizationsService } from './organizations/organizations.service';

import { PacientesService } from './pacientes/pacientes.service';

import { PerfilService } from './perfil/perfil.service';



/** Pré-carrega chunks e dados das telas mais usadas logo após entrar no painel. */

@Injectable({ providedIn: 'root' })

export class PrefetchService {

  private auth = inject(AbstractAuthService);

  private dashboard = inject(DashboardService);

  private agendas = inject(AgendasService);

  private exames = inject(ExamesService);

  private orgs = inject(OrganizationsService);

  private especialistas = inject(EspecialistasService);

  private pacientes = inject(PacientesService);

  private perfil = inject(PerfilService);



  private warmed = false;



  warmPainel(): void {

    if (this.warmed || !this.auth.isAuthenticated()) return;

    this.warmed = true;



    const role = this.auth.userRole();



    // Prioridade: tela inicial + dados críticos; chunks e APIs pesadas ficam para idle.

    if (role === 'paciente') {

      this.preloadRoute('/painel/portal-paciente');

      this.runStaggered(() => this.agendas.loadAll(), 0);

      this.runStaggered(() => this.exames.loadExames(), 200);

      this.runStaggered(() => this.orgs.explorarClinicas().subscribe(), 400);

      this.runStaggered(() => this.preloadRoute('/painel/explorar-clinicas'), 600);

    } else if (role === 'admin' || role === 'gestor' || role === 'especialista' || role === 'visualizador') {

      this.preloadRoute('/painel/dashboard');

      this.runStaggered(() => this.dashboard.loadData('mensal'), 0);

      this.runStaggered(() => this.perfil.getMe().subscribe(), 150);

      if (role === 'gestor' || role === 'admin') {

        this.runStaggered(() => this.pacientes.loadPacientes(), 400);

        this.runStaggered(() => this.especialistas.loadEspecialistas(), 700);

        this.runStaggered(() => this.preloadRoute('/painel/pacientes'), 300);

      }

      if (role === 'especialista') {

        this.runStaggered(() => this.agendas.loadAll(), 400);

      }

    }



    this.preloadRouteChunksIdle();

  }



  private runStaggered(fn: () => void, delayMs: number): void {

    const run = () => setTimeout(fn, delayMs);

    if (typeof requestIdleCallback === 'function') {

      requestIdleCallback(run, { timeout: delayMs + 500 });

    } else {

      run();

    }

  }



  private preloadRouteChunksIdle(): void {

    const role = this.auth.userRole();

    const priority: (() => Promise<unknown>)[] = [];



    if (role === 'paciente') {

      priority.push(

        () => import('../pages/painel/agendas/agendas'),

        () => import('../pages/painel/explorar-clinicas/explorar-clinicas'),

        () => import('../pages/painel/busca-profissionais/busca-profissionais'),

      );

    } else {

      priority.push(

        () => import('../pages/painel/dashboard/dashboard'),

        () => import('../pages/painel/pacientes/pacientes'),

        () => import('../pages/painel/agendas/agendas'),

      );

    }



    const secondary = [

      () => import('../pages/painel/chat/chat'),

      () => import('../pages/painel/meu-perfil/meu-perfil'),

      () => import('../pages/painel/fila/fila'),

      () => import('../pages/painel/especialistas/especialistas'),

    ];



    const chunks = [...priority, ...secondary];

    const run = (i: number) => {

      if (i >= chunks.length) return;

      chunks[i]().finally(() => {

        if (typeof requestIdleCallback === 'function') {

          requestIdleCallback(() => run(i + 1), { timeout: 2000 });

        } else {

          setTimeout(() => run(i + 1), 80);

        }

      });

    };



    this.runStaggered(() => run(0), 800);

  }



  preloadRoute(route: string): void {

    const map: Record<string, () => Promise<unknown>> = {

      '/painel/dashboard': () => import('../pages/painel/dashboard/dashboard'),

      '/painel/portal-paciente': () => import('../pages/painel/portal-paciente/portal-paciente'),

      '/painel/agendas': () => import('../pages/painel/agendas/agendas'),

      '/painel/pacientes': () => import('../pages/painel/pacientes/pacientes'),

      '/painel/explorar-clinicas': () => import('../pages/painel/explorar-clinicas/explorar-clinicas'),

      '/painel/busca-profissionais': () => import('../pages/painel/busca-profissionais/busca-profissionais'),

      '/painel/chat': () => import('../pages/painel/chat/chat'),

      '/painel/meu-perfil': () => import('../pages/painel/meu-perfil/meu-perfil'),

      '/painel/fila': () => import('../pages/painel/fila/fila'),

      '/painel/especialistas': () => import('../pages/painel/especialistas/especialistas'),

      '/painel/relatorios': () => import('../pages/painel/relatorios/relatorios'),

    };

    map[route]?.();

    const role = this.auth.userRole();
    switch (route) {
      case '/painel/dashboard':
        this.dashboard.loadData('mensal');
        break;
      case '/painel/pacientes':
        if (role === 'gestor' || role === 'admin') this.pacientes.loadPacientes();
        break;
      case '/painel/especialistas':
        if (role === 'gestor' || role === 'admin') this.especialistas.loadEspecialistas();
        break;
      case '/painel/agendas':
        this.agendas.loadAll();
        break;
      case '/painel/explorar-clinicas':
        this.orgs.explorarClinicas().subscribe();
        break;
      case '/painel/busca-profissionais':
        this.especialistas.loadEspecialidades();
        this.especialistas.loadEspecialistas();
        break;
      case '/painel/meu-perfil':
        this.perfil.getMe().subscribe();
        break;
      case '/painel/portal-paciente':
        this.agendas.loadAll();
        this.exames.loadExames();
        break;
    }

  }

}

