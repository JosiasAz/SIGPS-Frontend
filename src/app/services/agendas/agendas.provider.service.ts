import { Provider } from '@angular/core';
import { AbstractAgendasService } from './abstract-agendas.service';
import { MockedAgendasService } from './mocked-agendas.service';
import { AgendasService } from './agendas.service';
import { environment } from '../../env/environment';

export const AgendasProvider: Provider = {
    provide: AbstractAgendasService,
    useClass: AgendasService
};
