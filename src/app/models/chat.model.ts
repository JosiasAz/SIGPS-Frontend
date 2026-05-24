export interface ChatMessage {
  id: number | string;
  sender: 'me' | 'other';
  senderId?: number;
  senderName: string;
  text: string;
  time: string;
  read?: boolean;
}

export interface Conversation {
  userId: number;
  userName: string;
  userRole: string;
  userFoto?: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageDate: string;
  unreadCount: number;
}
