import { Injectable, signal, inject, computed, effect } from '@angular/core';
import { AbstractAuthService } from '../auth/abstract-auth.service';
import { AbstractChatService, ChatMessage } from './abstract-chat.service';
import { SimulationService } from '../simulation/simulation.service';

@Injectable({ providedIn: 'root' })
export class MockedChatService implements AbstractChatService {
  private authService = inject(AbstractAuthService);
  private simulationService = inject(SimulationService);
  
  private initialMessages: ChatMessage[] = [
    { id: 1, sender: 'sistema', senderName: 'Atendimento', text: 'Olá! Bem-vindo ao canal de mensagens do seu consultório / clínica no SIGPS. Como podemos ajudar hoje?', time: '09:00' },
    { id: 2, sender: 'user', senderName: 'Você', text: 'Gostaria de tirar uma dúvida sobre a minha última receita do Dr. Carlos.', time: '09:05' },
    { id: 3, sender: 'sistema', senderName: 'Atendimento', text: 'Claro! Vou transferir você para o profissional responsável. Só um minuto.', time: '09:06' },
  ];

  messages = signal<ChatMessage[]>(this.simulationService.load('chat_messages', this.initialMessages));
  lastReadCount = signal(this.simulationService.load('chat_last_read', 3));

  constructor() {
    // Persistência automática das mensagens
    effect(() => {
      this.simulationService.save('chat_messages', this.messages());
    });
    // Persistência do contador de lidas
    effect(() => {
      this.simulationService.save('chat_last_read', this.lastReadCount());
    });
  }

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
    
    // Determina o lado da bolha no chat:
    // Paciente sempre envia como 'user' (direita)
    // Especialista/Gestor sempre envia como 'sistema' (esquerda na visão do paciente)
    const senderFlow: 'user' | 'sistema' = userRole === 'paciente' ? 'user' : 'sistema';
    
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    this.messages.update(msgs => [
      ...msgs, 
      {
        id: Date.now(),
        sender: senderFlow,
        senderName: currentUser?.name || (senderFlow === 'user' ? 'Paciente' : 'Profissional'),
        text: text,
        time: timeString
      }
    ]);

    this.markAsRead();
  }

  clearHistory(): void {
    this.messages.set([]);
    this.lastReadCount.set(0);
  }
}
