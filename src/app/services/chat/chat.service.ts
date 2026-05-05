import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractChatService, ChatMessage } from './abstract-chat.service';
import { environment } from '../../env/environment';
import { AbstractAuthService } from '../auth/abstract-auth.service';
import { API_ENDPOINTS } from '../../config/endpoints';
import { WebSocketService } from '../../core/services/websocket.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService extends AbstractChatService {
  private http = inject(HttpClient);
  private authService = inject(AbstractAuthService);
  private wsService = inject(WebSocketService);
  private apiUrl = environment.apiUrl;

  messages = signal<ChatMessage[]>([]);
  
  unreadCount = computed(() => {
    return this.messages().filter(m => !m.read && m.sender !== 'user' && m.sender !== 'me').length;
  });

  constructor() {
    super();
    this.loadMessages();
    this.initWebSocket();
  }

  private initWebSocket() {
    // Only connect if not in mock mode and running in browser
    if (!environment.useMock && typeof window !== 'undefined') {
      const wsUrl = `${this.apiUrl.replace('http', 'ws')}${API_ENDPOINTS.CHAT.WS}`;
      this.wsService.connect(wsUrl);
      
      this.wsService.getMessages().subscribe(msg => {
        if (msg.type === 'chat_message') {
          this.messages.update(msgs => [...msgs, msg.data]);
        }
      });
    }
  }

  private loadMessages() {
    this.http.get<ChatMessage[]>(`${this.apiUrl}${API_ENDPOINTS.CHAT.MESSAGES}`).subscribe({
      next: (data) => this.messages.set(data),
      error: (err) => console.error('Erro ao buscar mensagens do chat:', err)
    });
  }

  sendMessage(text: string): void {
    const payload = { text };
    
    // If WebSocket is connected, we might want to send via WS or keep HTTP for persistence
    // For this implementation, we use HTTP and expect the WS to broadcast the message
    this.http.post<ChatMessage>(`${this.apiUrl}${API_ENDPOINTS.CHAT.MESSAGES}`, payload).subscribe({
      next: (sentMessage) => {
        // If not using WS, we manually add to the list
        if (environment.useMock) {
          this.messages.update(msgs => [...msgs, sentMessage]);
        }
      },
      error: (err) => console.error('Erro ao enviar mensagem:', err)
    });
  }

  markAsRead(): void {
    this.http.post(`${this.apiUrl}${API_ENDPOINTS.CHAT.READ}`, {}).subscribe({
      next: () => {
        this.messages.update(msgs => msgs.map(m => ({ ...m, read: true })));
      },
      error: (err) => console.error('Erro ao marcar mensagens como lidas:', err)
    });
  }

  clearHistory(): void {
    this.http.delete(`${this.apiUrl}${API_ENDPOINTS.CHAT.CLEAR}`).subscribe({
      next: () => {
        this.messages.set([]);
        console.log('Histórico do chat apagado com sucesso');
      },
      error: (err) => console.error('Erro ao apagar histórico do chat:', err)
    });
  }
}
