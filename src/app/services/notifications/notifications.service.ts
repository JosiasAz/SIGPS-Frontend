import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractNotificationsService, NotificationItem } from './abstract-notifications.service';
import { environment } from '../../env/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService extends AbstractNotificationsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  notifications = signal<NotificationItem[]>([]);
  unreadCount = computed(() => this.notifications().filter(n => !n.read).length);

  constructor() {
    super();
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.http.get<NotificationItem[]>(`${this.apiUrl}/api/v1/notifications/`).subscribe({
      next: (data) => this.notifications.set(data),
      error: (err) => console.error('Erro ao buscar notificações:', err)
    });
  }

  markAllAsRead(): void {
    this.http.post(`${this.apiUrl}/api/v1/notifications/mark-read`, {}).subscribe({
      next: () => {
        this.notifications.update(prev => prev.map(n => ({ ...n, read: true })));
      },
      error: (err) => console.error('Erro ao marcar todas as notificações como lidas:', err)
    });
  }

  markAsRead(id: number): void {
    this.http.post(`${this.apiUrl}/api/v1/notifications/mark-read`, { id }).subscribe({
      next: () => {
        this.notifications.update(prev =>
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
      },
      error: (err) => console.error(`Erro ao marcar notificação ${id} como lida:`, err)
    });
  }
}
