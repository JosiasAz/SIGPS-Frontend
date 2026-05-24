import { Component, inject, ElementRef, ViewChild, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AbstractChatService, Conversation } from '../../../services/chat/abstract-chat.service';
import { AbstractAuthService } from '../../../services/auth/abstract-auth.service';
import { AbstractEspecialistasService } from '../../../services/especialistas/abstract-especialistas.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat.html',
  styleUrls: ['../painel.scss', './chat.scss']
})
export class ChatComponent implements AfterViewChecked, OnInit {
  chatService = inject(AbstractChatService);
  private authService = inject(AbstractAuthService);
  private especialistasService = inject(AbstractEspecialistasService);
  private route = inject(ActivatedRoute);

  conversations = this.chatService.conversations;
  messages = this.chatService.messages;
  activeConversation = this.chatService.activeConversation;

  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  @ViewChild('msgInput') private msgInput!: ElementRef<HTMLInputElement>;

  private shouldScroll = false;

  ngOnInit() {
    this.chatService.loadConversations();

    this.route.queryParams.subscribe(params => {
      const withUserId = Number(params['with']);
      if (withUserId) {
        setTimeout(() => this.abrirConversa(withUserId), 300);
      }
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  abrirConversa(userId: number) {
    // Busca info do parceiro no serviço de especialistas para conversas novas
    const esp = this.especialistasService.getProfissionalById(userId);
    const partnerInfo = esp
      ? { userName: esp.nome, userRole: esp.especialidade || 'Especialista', userFoto: esp.foto }
      : undefined;

    this.chatService.openConversation(userId, partnerInfo);
    this.shouldScroll = true;
  }

  fecharConversa() {
    this.chatService.closeConversation();
  }

  sendMessage(text: string) {
    if (!text.trim()) return;
    this.chatService.sendMessage(text);
    if (this.msgInput) this.msgInput.nativeElement.value = '';
    this.shouldScroll = true;
  }

  onKeyEnter(event: Event, text: string) {
    event.preventDefault();
    this.sendMessage(text);
  }

  clearConversa() {
    if (confirm('Apagar toda esta conversa? Esta ação não pode ser desfeita.')) {
      this.chatService.clearConversation();
    }
  }

  inicialAvatar(nome: string): string {
    return nome ? nome.charAt(0).toUpperCase() : '?';
  }

  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch { }
  }
}
