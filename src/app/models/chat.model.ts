export interface ChatMessage {
  id: number | string;
  sender: 'user' | 'sistema' | 'me';
  senderName: string;
  text: string;
  time: string;
  read?: boolean;
}
