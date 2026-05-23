import { Provider } from '@angular/core';
import { AbstractNotificationsService } from './abstract-notifications.service';
import { NotificationsService } from './notifications.service';

export const NotificationsProvider: Provider = {
  provide: AbstractNotificationsService,
  useClass: NotificationsService
};
