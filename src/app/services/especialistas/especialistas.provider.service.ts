import { Provider } from '@angular/core';
import { AbstractEspecialistasService } from './abstract-especialistas.service';
import { MockedEspecialistasService } from './mocked-especialistas.service';
import { EspecialistasService } from './especialistas.service';
import { environment } from '../../env/environment';

export const EspecialistasProvider: Provider = {
    provide: AbstractEspecialistasService,
    useClass: true || environment.useMock ? MockedEspecialistasService : EspecialistasService // TODO: Remove true || once backend is ready
};
