import { Provider } from '@angular/core';
import { AbstractEspecialistasService } from './abstract-especialistas.service';
import { MockedEspecialistasService } from './mocked-especialistas.service';
import { EspecialistasService } from './especialistas.service';
import { environment } from '../../env/environment';

export const EspecialistasProvider: Provider = {
    provide: AbstractEspecialistasService,
    useClass: environment.useMock ? MockedEspecialistasService : EspecialistasService
};
