import { Provider } from '@angular/core';
import { AbstractConfigService } from './abstract-config.service';
import { MockedConfigService } from './mocked-config.service';
import { ConfigService } from './config.service';
import { environment } from '../../env/environment';

export const ConfigProvider: Provider = {
    provide: AbstractConfigService,
    useClass: environment.useMock ? MockedConfigService : ConfigService
};
