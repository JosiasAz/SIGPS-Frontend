import { Signal } from '@angular/core';
import { ChatMessage } from '../../models/chat.model';
export type { ChatMessage };

export abstract class AbstractChatService {
  abstract messages: Signal<ChatMessage[]>;
  abstract unreadCount: Signal<number>;
  abstract sendMessage(text: string): void;
}
