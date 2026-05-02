import { Component, inject, ElementRef, ViewChild, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AbstractChatService, ChatMessage } from '../../../services/chat/abstract-chat.service';
import { AbstractAuthService } from '../../../services/auth/abstract-auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './chat.html',
  styleUrls: ['../painel.scss', './chat.scss']
})
export class ChatComponent implements AfterViewChecked, OnInit {
  chatService = inject(AbstractChatService);
  authService = inject(AbstractAuthService);
  messages = this.chatService.messages;

  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  isMyMessage(msg: ChatMessage): boolean {
    const role = this.authService.userRole();
    if (role === 'paciente') return msg.sender === 'user';
    return msg.sender === 'sistema';
  }

  sendMessage(text: string) {
    if (!text.trim()) return;
    this.chatService.sendMessage(text);
  }

  ngOnInit() {
    this.chatService.markAsRead();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  clearChatHistory() {
    if (confirm('Tem certeza que deseja apagar todo o histórico do chat? Esta ação não pode ser desfeita.')) {
      this.chatService.clearHistory();
    }
  }

  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
}
