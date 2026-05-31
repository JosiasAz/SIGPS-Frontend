import { Routes } from '@angular/router';

import { LandingPageComponent } from '../pages/landing-page/landing-page.component';

import { Login } from '../pages/login/login';

import { Cadastro } from '../pages/cadastro/cadastro';

import { EsqueciSenhaComponent } from '../pages/esqueci-senha/esqueci-senha';

import { RedefinirSenhaComponent } from '../pages/redefinir-senha/redefinir-senha';

import { Painel } from '../pages/painel/painel';

import { authGuard } from '../core/guards/auth.guard';

import { roleGuard } from '../core/guards/role.guard';

import { EquipeComponent } from '../pages/equipe/equipe';



export const routes: Routes = [

    { path: '', component: LandingPageComponent },

    { path: 'login', component: Login },

    { path: 'cadastro', component: Cadastro },

    { path: 'esqueci-senha', component: EsqueciSenhaComponent },

    { path: 'redefinir-senha', component: RedefinirSenhaComponent },

    { path: 'equipe', component: EquipeComponent },

    {

        path: 'painel',

        component: Painel,

        canActivate: [authGuard],

        children: [

            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

            {

                path: 'portal-paciente',

                loadComponent: () => import('../pages/painel/portal-paciente/portal-paciente').then(m => m.PortalPacienteComponent),

                canActivate: [roleGuard(['paciente'])]

            },

            {

                path: 'exames',

                loadComponent: () => import('../pages/painel/exames/exames').then(m => m.ExamesComponent),

                canActivate: [roleGuard(['paciente', 'admin', 'gestor', 'especialista', 'visualizador'])]

            },

            {

                path: 'chat',

                loadComponent: () => import('../pages/painel/chat/chat').then(m => m.ChatComponent),

                canActivate: [roleGuard(['paciente', 'admin', 'gestor', 'especialista', 'visualizador'])]

            },

            {

                path: 'meu-perfil',

                loadComponent: () => import('../pages/painel/meu-perfil/meu-perfil').then(m => m.MeuPerfilComponent),

                canActivate: [roleGuard(['paciente', 'admin', 'gestor', 'especialista', 'visualizador'])]

            },

            {

                path: 'perfil-profissional/:id',

                loadComponent: () => import('../pages/painel/perfil-profissional/perfil-profissional').then(m => m.PerfilProfissionalComponent),

                canActivate: [roleGuard(['paciente', 'admin', 'gestor', 'visualizador', 'especialista'])]

            },

            {

                path: 'busca-profissionais',

                loadComponent: () => import('../pages/painel/busca-profissionais/busca-profissionais').then(m => m.BuscaProfissionaisComponent),

                canActivate: [roleGuard(['paciente', 'admin', 'gestor', 'visualizador', 'especialista'])]

            },

            {

                path: 'explorar-clinicas',

                loadComponent: () => import('../pages/painel/explorar-clinicas/explorar-clinicas').then(m => m.ExplorarClinicasComponent),

                canActivate: [roleGuard(['paciente'])]

            },

            {

                path: 'dashboard',

                loadComponent: () => import('../pages/painel/dashboard/dashboard').then(m => m.DashboardComponent),

                canActivate: [roleGuard(['admin', 'gestor', 'especialista', 'visualizador'])]

            },

            {

                path: 'pacientes',

                loadComponent: () => import('../pages/painel/pacientes/pacientes').then(m => m.PacientesComponent),

                canActivate: [roleGuard(['admin', 'gestor', 'especialista', 'visualizador'])]

            },

            {

                path: 'agendas',

                loadComponent: () => import('../pages/painel/agendas/agendas').then(m => m.AgendasComponent),

                canActivate: [roleGuard(['admin', 'gestor', 'especialista', 'paciente'])]

            },

            {

                path: 'especialistas',

                loadComponent: () => import('../pages/painel/especialistas/especialistas').then(m => m.EspecialistasComponent),

                canActivate: [roleGuard(['admin', 'gestor'])]

            },

            {

                path: 'fila',

                loadComponent: () => import('../pages/painel/fila/fila').then(m => m.FilaComponent),

                canActivate: [roleGuard(['gestor', 'especialista', 'visualizador'])]

            },

            {

                path: 'gestao-ia',

                loadComponent: () => import('../pages/painel/gestao-ia/gestao-ia').then(m => m.GestaoIAComponent),

                canActivate: [roleGuard(['gestor', 'especialista'])]

            },

            {

                path: 'relatorios',

                loadComponent: () => import('../pages/painel/relatorios/relatorios').then(m => m.RelatoriosComponent),

                canActivate: [roleGuard(['admin', 'gestor'])]

            },

            {

                path: 'config',

                loadComponent: () => import('../pages/painel/config/config').then(m => m.ConfigComponent),

                canActivate: [roleGuard(['admin'])]

            },

            {

                path: 'documentacao',

                loadComponent: () => import('../pages/painel/documentacao/documentacao').then(m => m.DocumentacaoComponent),

                canActivate: [roleGuard(['admin', 'gestor', 'especialista', 'visualizador', 'paciente'])]

            },

        ]

    },

    { path: '**', redirectTo: '' },

];


