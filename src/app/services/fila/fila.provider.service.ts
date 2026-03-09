import { Provider } from '@angular/core';
import { AbstractFilaService } from './abstract-fila.service';
import { MockedFilaService } from './mocked-fila.service';
import { FilaService } from './fila.service';
import { environment } from '../../env/environment';

export const FilaProvider: Provider = {
    provide: AbstractFilaService,
    useClass: environment.useMock ? MockedFilaService : FilaService
};
