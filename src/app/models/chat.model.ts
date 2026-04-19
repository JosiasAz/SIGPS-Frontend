export interface ChatMessage {
  id: number;
  sender: 'user' | 'sistema';
  senderName: string;
  text: string;
  time: string;
}
