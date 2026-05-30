import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractAgendasService } from './agendas/abstract-agendas.service';
import { AbstractPacientesService } from './pacientes/abstract-pacientes.service';
import { AbstractDashboardService } from './dashboard/abstract-dashboard.service';
import { AbstractFilaService } from './fila/abstract-fila.service';
import { AbstractEspecialistasService } from './especialistas/abstract-especialistas.service';
import { AgendasService } from './agendas/agendas.service';
import { PacientesService } from './pacientes/pacientes.service';
import { DashboardService } from './dashboard/dashboard.service';
import { FilaService } from './fila/fila.service';
import { EspecialistasService } from './especialistas/especialistas.service';

/** Recarrega dados após troca de organização, sem reload completo da página. */
@Injectable({ providedIn: 'root' })
export class AppRefreshService {
    private router = inject(Router);
    private agendas = inject(AbstractAgendasService);
    private pacientes = inject(AbstractPacientesService);
    private dashboard = inject(AbstractDashboardService);
    private fila = inject(AbstractFilaService);
    private especialistas = inject(AbstractEspecialistasService);

    onOrganizationChanged(): void {
        (this.agendas as AgendasService).invalidateCache?.();
        (this.pacientes as PacientesService).invalidateCache?.();
        (this.dashboard as DashboardService).invalidateCache?.();
        (this.fila as FilaService).invalidateCache?.();
        (this.especialistas as EspecialistasService).invalidateCache?.();

        const route = this.router.url;
        if (route.includes('/agendas') || route.includes('/pacientes') || route.includes('/portal-paciente')) {
            (this.agendas as AgendasService).loadAll?.();
        }
        if (route.includes('/pacientes')) {
            (this.pacientes as PacientesService).loadPacientes?.();
        }
        if (route.includes('/dashboard')) {
            (this.dashboard as DashboardService).loadData?.();
        }
        if (route.includes('/fila') || route.includes('/gestao-ia')) {
            (this.fila as FilaService).refreshFila?.(true);
        }
        if (route.includes('/especialistas') || route.includes('/busca-profissionais')) {
            (this.especialistas as EspecialistasService).loadEspecialistas?.({}, true);
        }
    }
}
