import { Component, inject, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChatService, ChatMessage } from '../../../services/chat/chat.service';
import { AbstractAuthService } from '../../../services/auth/abstract-auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './chat.html',
  styleUrls: ['../painel.scss', './chat.scss']
})
export class ChatComponent implements AfterViewChecked {
  chatService = inject(ChatService);
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

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
}
