import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractChatService, ChatMessage } from './abstract-chat.service';
import { environment } from '../../env/environment';
import { AbstractAuthService } from '../auth/abstract-auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService extends AbstractChatService {
  private http = inject(HttpClient);
  private authService = inject(AbstractAuthService);
  private apiUrl = environment.apiUrl;

  messages = signal<ChatMessage[]>([]);
  
  unreadCount = computed(() => {
    return 0; // Implement logic with backend
  });

  constructor() {
    super();
    this.loadMessages();
  }

  private loadMessages() {
    // Example endpoint - change to match real API
    this.http.get<ChatMessage[]>(`${this.apiUrl}/api/v1/chat/messages`).subscribe({
      next: (data) => this.messages.set(data),
      error: (err) => console.error('Erro ao buscar mensagens do chat:', err)
    });
  }

  sendMessage(text: string): void {
    const payload = { text };
    this.http.post<ChatMessage>(`${this.apiUrl}/api/v1/chat/messages`, payload).subscribe({
      next: (sentMessage) => {
        this.messages.update(msgs => [...msgs, sentMessage]);
      },
      error: (err) => console.error('Erro ao enviar mensagem:', err)
    });
  }

  markAsRead(): void {
    this.http.post(`${this.apiUrl}/api/v1/chat/messages/read`, {}).subscribe({
      next: () => {
        // You can update unreadCount logic here later
      },
      error: (err) => console.error('Erro ao marcar mensagens como lidas:', err)
    });
  }
}
