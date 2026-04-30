import { Injectable, signal, inject, computed } from '@angular/core';
import { AbstractAuthService } from '../auth/abstract-auth.service';
import { AbstractChatService, ChatMessage } from './abstract-chat.service';

@Injectable({ providedIn: 'root' })
export class MockedChatService implements AbstractChatService {
  private authService = inject(AbstractAuthService);
  
  messages = signal<ChatMessage[]>([
    { id: 1, sender: 'sistema', senderName: 'Atendimento', text: 'Olá! Bem-vindo ao canal de mensagens do seu consultório / clínica no SIGPS. Como podemos ajudar hoje?', time: '09:00' },
    { id: 2, sender: 'user', senderName: 'Você', text: 'Gostaria de tirar uma dúvida sobre a minha última receita do Dr. Carlos.', time: '09:05' },
    { id: 3, sender: 'sistema', senderName: 'Atendimento', text: 'Claro! Vou transferir você para o profissional responsável. Só um minuto.', time: '09:06' },
  ]);

  lastReadCount = signal(3);

  unreadCount = computed(() => {
    const total = this.messages().length;
    return Math.max(0, total - this.lastReadCount());
  });

  markAsRead(): void {
    this.lastReadCount.set(this.messages().length);
  }

  sendMessage(text: string): void {
    const userRole = this.authService.userRole();
    const currentUser = this.authService.currentUser();
    
    // Se logado como 'paciente', a bolha é verde e vai pra direita ('user'). 
    // Qualquer outro papel (médico, admin, etc.) responde como o consultório/sistema.
    const senderFlow: 'user' | 'sistema' = userRole === 'paciente' ? 'user' : 'sistema';
    
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    this.messages.update(msgs => [
      ...msgs, 
      {
        id: msgs.length + 1,
        sender: senderFlow,
        senderName: currentUser?.name || (senderFlow === 'user' ? 'Paciente' : 'Clínica'),
        text: text,
        time: timeString
      }
    ]);

    // O usuário acabou de interagir, então leu tudo até aqui
    this.markAsRead();

    // Simular resposta automática após 3 segundos para demonstração do badge de notificação
    setTimeout(() => {
        const replyNow = new Date();
        const replyTimeString = `${replyNow.getHours().toString().padStart(2, '0')}:${replyNow.getMinutes().toString().padStart(2, '0')}`;
        const autoReplySender = senderFlow === 'user' ? 'sistema' : 'user';
        const autoReplyName = autoReplySender === 'sistema' ? 'Atendimento' : 'Paciente';
        
        this.messages.update(msgs => [
            ...msgs,
            {
                id: msgs.length + 1,
                sender: autoReplySender,
                senderName: autoReplyName,
                text: 'Esta é uma mensagem automática. O profissional responderá em breve!',
                time: replyTimeString
            }
        ]);
    }, 3000);
  }
}
