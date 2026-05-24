import { Injectable, signal } from '@angular/core';
import { AbstractRelatoriosService } from './abstract-relatorios.service';

@Injectable({
    providedIn: 'root'
})
export class MockedRelatoriosService extends AbstractRelatoriosService {
    kpis = signal([
        { label: 'Total de Consultas (Mês)', value: '1.450' },
        { label: 'Tempo Médio de Espera', value: '18 min' },
        { label: 'Especialidade mais procurada', value: 'Clínico Geral' },
        { label: 'Satisfação do Paciente', value: '4.8/5.0' }
    ]);
}
