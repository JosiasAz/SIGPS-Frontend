import { Provider } from '@angular/core';
import { AbstractPacientesService } from './abstract-pacientes.service';
import { MockedPacientesService } from './mocked-pacientes.service';
import { PacientesService } from './pacientes.service';
import { environment } from '../../env/environment';

export const PacientesProvider: Provider = {
    provide: AbstractPacientesService,
    useClass: environment.useMock ? MockedPacientesService : PacientesService
};
