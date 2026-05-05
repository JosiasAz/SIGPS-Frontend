import { Provider } from '@angular/core';
import { AbstractRelatoriosService } from './abstract-relatorios.service';
import { MockedRelatoriosService } from './mocked-relatorios.service';
import { RelatoriosService } from './relatorios.service';
import { environment } from '../../env/environment';

export const RelatoriosProvider: Provider = {
    provide: AbstractRelatoriosService,
    useClass: environment.useMock ? MockedRelatoriosService : RelatoriosService
};
