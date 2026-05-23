import { Injectable, signal, computed } from '@angular/core';
import { AbstractChatService, ChatMessage, Conversation, ConversationPartner } from './abstract-chat.service';

@Injectable({ providedIn: 'root' })
export class MockedChatService extends AbstractChatService {
  conversations = signal<Conversation[]>([]);
  messages = signal<ChatMessage[]>([]);
  activeConversation = signal<Conversation | null>(null);
  unreadCount = computed(() => this.conversations().reduce((acc, c) => acc + c.unreadCount, 0));

  loadConversations(): void {}

  openConversation(userId: number, partnerInfo?: ConversationPartner): void {
    const existente = this.conversations().find(c => c.userId === userId);
    if (existente) {
      this.activeConversation.set(existente);
    } else if (partnerInfo) {
      const nova: Conversation = { userId, userName: partnerInfo.userName, userRole: partnerInfo.userRole, userFoto: partnerInfo.userFoto, lastMessage: '', lastMessageTime: '', lastMessageDate: '', unreadCount: 0 };
      this.conversations.update(convs => [nova, ...convs]);
      this.activeConversation.set(nova);
    }
    this.messages.set([]);
  }

  closeConversation(): void {
    this.activeConversation.set(null);
    this.messages.set([]);
  }

  sendMessage(text: string): void {
    const conv = this.activeConversation();
    if (!conv || !text.trim()) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    this.messages.update(msgs => [...msgs, { id: Date.now(), sender: 'me', senderName: 'Você', text, time, read: true }]);
    this.conversations.update(convs => convs.map(c => c.userId === conv.userId ? { ...c, lastMessage: text, lastMessageTime: time } : c));
  }

  markAsRead(): void {
    const conv = this.activeConversation();
    if (!conv) return;
    this.conversations.update(convs => convs.map(c => c.userId === conv.userId ? { ...c, unreadCount: 0 } : c));
  }

  clearConversation(): void {
    const conv = this.activeConversation();
    if (!conv) return;
    this.messages.set([]);
    this.conversations.update(convs => convs.filter(c => c.userId !== conv.userId));
    this.activeConversation.set(null);
  }
}
