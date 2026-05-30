import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractChatService, ChatMessage, Conversation, ConversationPartner } from './abstract-chat.service';
import { environment } from '../../env/environment';
import { API_ENDPOINTS } from '../../config/endpoints';

@Injectable({ providedIn: 'root' })
export class ChatService extends AbstractChatService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  conversations = signal<Conversation[]>([]);
  messages = signal<ChatMessage[]>([]);
  activeConversation = signal<Conversation | null>(null);

  unreadCount = computed(() =>
    this.conversations().reduce((acc, c) => acc + c.unreadCount, 0)
  );

  constructor() {
    super();
  }

  loadConversations(): void {
    this.http.get<Conversation[]>(`${this.apiUrl}${API_ENDPOINTS.CHAT.CONVERSATIONS}`).subscribe({
      next: (data) => this.conversations.set(data),
      error: (err) => console.error('Erro ao buscar conversas:', err)
    });
  }

  openConversation(userId: number, partnerInfo?: ConversationPartner): void {
    this.messages.set([]);

    // Determina a conversa ativa — existente na lista ou nova via partnerInfo
    const existente = this.conversations().find(c => c.userId === userId);
    if (existente) {
      this.activeConversation.set(existente);
    } else if (partnerInfo) {
      const nova: Conversation = {
        userId,
        userName: partnerInfo.userName,
        userRole: partnerInfo.userRole,
        userFoto: partnerInfo.userFoto,
        lastMessage: '',
        lastMessageTime: '',
        lastMessageDate: '',
        unreadCount: 0
      };
      this.conversations.update(convs => [nova, ...convs]);
      this.activeConversation.set(nova);
    }

    this.http.get<ChatMessage[]>(`${this.apiUrl}${API_ENDPOINTS.CHAT.MESSAGES(userId)}`).subscribe({
      next: (data) => {
        this.messages.set(data);
        this.markAsRead();
      },
      error: (err) => console.error('Erro ao carregar mensagens:', err)
    });
  }

  closeConversation(): void {
    this.activeConversation.set(null);
    this.messages.set([]);
  }

  sendMessage(text: string): void {
    const conv = this.activeConversation();
    if (!conv || !text.trim()) return;

    this.http.post<ChatMessage>(`${this.apiUrl}${API_ENDPOINTS.CHAT.MESSAGES(conv.userId)}`, { text }).subscribe({
      next: (msg) => {
        this.messages.update(msgs => [...msgs, msg]);
        this.conversations.update(convs =>
          convs.map(c => c.userId === conv.userId
            ? { ...c, lastMessage: msg.text, lastMessageTime: msg.time }
            : c
          )
        );
      },
      error: (err) => console.error('Erro ao enviar mensagem:', err)
    });
  }

  markAsRead(): void {
    const conv = this.activeConversation();
    if (!conv || conv.unreadCount === 0) return;
    this.http.patch(`${this.apiUrl}${API_ENDPOINTS.CHAT.READ(conv.userId)}`, {}).subscribe({
      next: () => this.conversations.update(convs =>
        convs.map(c => c.userId === conv.userId ? { ...c, unreadCount: 0 } : c)
      ),
      error: (err) => console.error('Erro ao marcar como lidas:', err)
    });
  }

  clearConversation(): void {
    const conv = this.activeConversation();
    if (!conv) return;
    this.http.delete(`${this.apiUrl}${API_ENDPOINTS.CHAT.MESSAGES(conv.userId)}`).subscribe({
      next: () => {
        this.messages.set([]);
        this.conversations.update(convs => convs.filter(c => c.userId !== conv.userId));
        this.activeConversation.set(null);
      },
      error: (err) => console.error('Erro ao apagar conversa:', err)
    });
  }
}
