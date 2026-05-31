import { Injectable, signal, computed } from '@angular/core';
import { AbstractChatService, ChatMessage, Conversation, ConversationPartner } from './abstract-chat.service';

const CONVERSAS_INICIAIS: Conversation[] = [
  {
    userId: 10,
    userName: 'Dr. Roberto Lins',
    userRole: 'Cardiologia',
    lastMessage: 'Confirmo sua consulta amanhã às 14h30.',
    lastMessageTime: '09:15',
    lastMessageDate: 'Hoje',
    unreadCount: 1,
  },
  {
    userId: 11,
    userName: 'Dra. Amanda Silva',
    userRole: 'Dermatologia',
    lastMessage: 'Envie o resultado do exame quando estiver disponível.',
    lastMessageTime: 'Ontem',
    lastMessageDate: 'Ontem',
    unreadCount: 0,
  },
  {
    userId: 12,
    userName: 'Dr. Carlos Mendes',
    userRole: 'Pediatria',
    lastMessage: 'Receita atualizada no portal.',
    lastMessageTime: '08:40',
    lastMessageDate: 'Hoje',
    unreadCount: 0,
  },
];

const MENSAGENS_DEMO: ChatMessage[] = [
  { id: 1, sender: 'other', senderName: 'Dr. Roberto Lins', text: 'Bom dia! Sua consulta de cardiologia está confirmada.', time: '09:10', read: true },
  { id: 2, sender: 'me', senderName: 'Você', text: 'Obrigado, doutor. Preciso levar exames anteriores?', time: '09:12', read: true },
  { id: 3, sender: 'other', senderName: 'Dr. Roberto Lins', text: 'Sim, traga o último ecocardiograma e a lista de medicamentos.', time: '09:14', read: true },
  { id: 4, sender: 'other', senderName: 'Dr. Roberto Lins', text: 'Confirmo sua consulta amanhã às 14h30.', time: '09:15', read: false },
];

@Injectable({ providedIn: 'root' })
export class MockedChatService extends AbstractChatService {
  conversations = signal<Conversation[]>([...CONVERSAS_INICIAIS]);
  messages = signal<ChatMessage[]>([]);
  activeConversation = signal<Conversation | null>(null);
  unreadCount = computed(() => this.conversations().reduce((acc, c) => acc + c.unreadCount, 0));

  loadConversations(): void {
    if (this.conversations().length === 0) {
      this.conversations.set([...CONVERSAS_INICIAIS]);
    }
  }

  openConversation(userId: number, partnerInfo?: ConversationPartner): void {
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
        unreadCount: 0,
      };
      this.conversations.update(convs => [nova, ...convs]);
      this.activeConversation.set(nova);
    }
    this.messages.set(userId === 10 ? [...MENSAGENS_DEMO] : []);
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
