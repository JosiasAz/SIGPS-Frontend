import { Signal } from '@angular/core';

export interface NotificationItem {
  id: number;
  message: string;
  read: boolean;
  route: string;
  time: string;
}

export abstract class AbstractNotificationsService {
  abstract notifications: Signal<NotificationItem[]>;
  abstract unreadCount: Signal<number>;
  abstract loadNotifications(): void;
  abstract markAllAsRead(): void;
  abstract markAsRead(id: number): void;
}
