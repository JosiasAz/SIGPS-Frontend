import { Signal } from '@angular/core';
import { ChatMessage, Conversation } from '../../models/chat.model';
export type { ChatMessage, Conversation };

export interface ConversationPartner {
  userName: string;
  userRole: string;
  userFoto?: string;
}

export abstract class AbstractChatService {
  abstract conversations: Signal<Conversation[]>;
  abstract messages: Signal<ChatMessage[]>;
  abstract activeConversation: Signal<Conversation | null>;
  abstract unreadCount: Signal<number>;

  abstract loadConversations(): void;
  /** Abre a conversa com userId. Passa partnerInfo quando o parceiro ainda não está na lista. */
  abstract openConversation(userId: number, partnerInfo?: ConversationPartner): void;
  abstract closeConversation(): void;
  abstract sendMessage(text: string): void;
  abstract markAsRead(): void;
  abstract clearConversation(): void;
}
