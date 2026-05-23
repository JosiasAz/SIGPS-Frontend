import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '../core/interceptors/auth.interceptor';

import { routes } from '../routes/app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AuthProvider } from '../services/auth/auth.provider.service';
import { DashboardProvider } from '../services/dashboard/dashboard.provider.service';
import { PacientesProvider } from '../services/pacientes/pacientes.provider.service';
import { AgendasProvider } from '../services/agendas/agendas.provider.service';
import { EspecialistasProvider } from '../services/especialistas/especialistas.provider.service';
import { FilaProvider } from '../services/fila/fila.provider.service';
import { RelatoriosProvider } from '../services/relatorios/relatorios.provider.service';
import { ConfigProvider } from '../services/config/config.provider.service';
import { ChatProvider } from '../services/chat/chat.provider.service';
import { ExamesProvider } from '../services/exames/exames.provider.service';
import { NotificationsProvider } from '../services/notifications/notifications.provider.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideClientHydration(withEventReplay()),
    AuthProvider,
    DashboardProvider,
    PacientesProvider,
    AgendasProvider,
    EspecialistasProvider,
    FilaProvider,
    RelatoriosProvider,
    ConfigProvider,
    ChatProvider,
    ExamesProvider,
    NotificationsProvider
  ]
};
