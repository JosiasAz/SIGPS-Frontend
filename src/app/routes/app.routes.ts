import { Routes } from '@angular/router';
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
import { authGuard } from '../guards/auth.guard';
import { roleGuard } from '../guards/role.guard';

export const routes: Routes = [
    { path: '', component: LandingPageComponent },
    { path: 'login', component: Login },
    { path: 'cadastro', component: Cadastro },
    {
        path: 'painel',
        component: Painel,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },
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
                path: 'relatorios',
                component: RelatoriosComponent,
                canActivate: [roleGuard(['admin', 'gestor'])]
            },
            {
                path: 'config',
                component: ConfigComponent,
                canActivate: [roleGuard(['admin'])]
            },
        ]
    },
    { path: '**', redirectTo: '' },
];
