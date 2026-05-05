import { Provider } from '@angular/core';
import { environment } from '../../env/environment';
import { AbstractExamesService } from './abstract-exames.service';
import { MockedExamesService } from './mocked-exames.service';
import { ExamesService } from './exames.service';

export const ExamesProvider: Provider = {
  provide: AbstractExamesService,
  useClass: ExamesService
};
