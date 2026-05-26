import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LandingPageComponent } from '../pages/landing-page/landing-page.component';
import { Login } from '../pages/login/login';
import { Cadastro } from '../pages/cadastro/cadastro';
import { Painel } from '../pages/painel/painel';
import { DashboardComponent } from '../pages/painel/dashboard/dashboard';
import { PacientesComponent } from '../pages/painel/pacientes/pacientes';
import { AgendasComponent } from '../pages/painel/agendas/agendas';
import { EspecialistasComponent } from '../pages/painel/especialistas/especialistas';
import { FilaComponent } from '../pages/painel/fila/fila';
import { RelatoriosComponent } from '../pages/painel/relatorios/relatorios';
import { ConfigComponent } from '../pages/painel/config/config';
import { authGuard } from '../core/guards/auth.guard';
import { roleGuard } from '../core/guards/role.guard';
import { AbstractAuthService } from '../services/auth/abstract-auth.service';
import { PortalPacienteComponent } from '../pages/painel/portal-paciente/portal-paciente';
import { ExamesComponent } from '../pages/painel/exames/exames';
import { ChatComponent } from '../pages/painel/chat/chat';
import { PerfilProfissionalComponent } from '../pages/painel/perfil-profissional/perfil-profissional';
import { BuscaProfissionaisComponent } from '../pages/painel/busca-profissionais/busca-profissionais';
import { GestaoIAComponent } from '../pages/painel/gestao-ia/gestao-ia';
import { MeuPerfilComponent } from '../pages/painel/meu-perfil/meu-perfil';
import { EquipeComponent } from '../pages/equipe/equipe';
import { DocumentacaoComponent } from '../pages/painel/documentacao/documentacao';

export const routes: Routes = [
    { path: '', component: LandingPageComponent },
    { path: 'login', component: Login },
    { path: 'cadastro', component: Cadastro },
    { path: 'equipe', component: EquipeComponent },
    {
        path: 'painel',
        component: Painel,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'portal-paciente',
                component: PortalPacienteComponent,
                canActivate: [roleGuard(['paciente'])]
            },
            {
                path: 'exames',
                component: ExamesComponent,
                canActivate: [roleGuard(['paciente', 'admin', 'gestor', 'especialista', 'visualizador'])]
            },
            {
                path: 'chat',
                component: ChatComponent,
                canActivate: [roleGuard(['paciente', 'admin', 'gestor', 'especialista', 'visualizador'])]
            },
            {
                path: 'meu-perfil',
                component: MeuPerfilComponent,
                canActivate: [roleGuard(['paciente', 'admin', 'gestor', 'especialista', 'visualizador'])]
            },
            {
                path: 'perfil-profissional/:id',
                component: PerfilProfissionalComponent,
                canActivate: [roleGuard(['paciente', 'admin', 'gestor', 'visualizador', 'especialista'])]
            },
            {
                path: 'busca-profissionais',
                component: BuscaProfissionaisComponent,
                canActivate: [roleGuard(['paciente', 'admin', 'gestor', 'visualizador', 'especialista'])]
            },
            { 
                path: 'dashboard', 
                component: DashboardComponent,
                canActivate: [roleGuard(['admin', 'gestor', 'especialista', 'visualizador'])]
            },
            {
                path: 'pacientes',
                component: PacientesComponent,
                canActivate: [roleGuard(['admin', 'gestor', 'especialista', 'visualizador'])]
            },
            {
                path: 'agendas',
                component: AgendasComponent,
                canActivate: [roleGuard(['admin', 'gestor', 'especialista', 'paciente'])]
            },
            {
                path: 'especialistas',
                component: EspecialistasComponent,
                canActivate: [roleGuard(['admin', 'gestor'])]
            },
            {
                path: 'fila',
                component: FilaComponent,
                canActivate: [roleGuard(['admin', 'gestor', 'especialista', 'visualizador'])]
            },
            {
                path: 'gestao-ia',
                component: GestaoIAComponent,
                canActivate: [roleGuard(['admin', 'gestor', 'especialista'])]
            },
            {
                path: 'relatorios',
                component: RelatoriosComponent,
                canActivate: [roleGuard(['admin', 'gestor'])]
            },
            {
                path: 'config',
                component: ConfigComponent,
                canActivate: [roleGuard(['admin'])]
            },
            {
                path: 'documentacao',
                component: DocumentacaoComponent,
                canActivate: [roleGuard(['admin', 'gestor', 'especialista', 'visualizador', 'paciente'])]
            },
        ]
    },
    { path: '**', redirectTo: '' },
];
