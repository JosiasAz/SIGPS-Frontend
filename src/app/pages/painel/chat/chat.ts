import { Component, inject, ElementRef, ViewChild, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AbstractChatService, Conversation } from '../../../services/chat/abstract-chat.service';
import { AbstractAuthService } from '../../../services/auth/abstract-auth.service';
import { AbstractEspecialistasService } from '../../../services/especialistas/abstract-especialistas.service';
import { EspecialistasService } from '../../../services/especialistas/especialistas.service';

import { MediaUrlPipe } from '../../../pipes/media-url.pipe';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, RouterLink, MediaUrlPipe],
  templateUrl: './chat.html',
  styleUrls: ['../painel.scss', './chat.scss']
})
export class ChatComponent implements AfterViewChecked, OnInit {
  chatService = inject(AbstractChatService);
  private authService = inject(AbstractAuthService);
  private especialistasService = inject(AbstractEspecialistasService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  conversations = this.chatService.conversations;
  messages = this.chatService.messages;
  activeConversation = this.chatService.activeConversation;
  isPaciente = () => this.authService.userRole() === 'paciente';

  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  @ViewChild('msgInput') private msgInput!: ElementRef<HTMLInputElement>;

  private shouldScroll = false;
  private shouldFocusInput = false;

  ngOnInit() {
    this.chatService.loadConversations();
    (this.especialistasService as EspecialistasService).loadEspecialistas();

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
    if (this.shouldFocusInput && this.msgInput) {
      this.msgInput.nativeElement.focus();
      this.shouldFocusInput = false;
    }
  }

  abrirConversa(userId: number) {
    const esp = this.especialistasService.getProfissionalById(userId);
    if (esp) {
      this.abrirComParceiro(userId, {
        userName: esp.nome,
        userRole: esp.especialidade || 'Especialista',
        userFoto: esp.foto,
      });
      return;
    }

    const realService = this.especialistasService as EspecialistasService;
    realService.getProfissionalByIdFromApi(userId).subscribe({
      next: (prof) => {
        this.abrirComParceiro(userId, {
          userName: prof.nome,
          userRole: prof.especialidade || 'Especialista',
          userFoto: prof.foto,
        });
      },
      error: () => {
        this.abrirComParceiro(userId, {
          userName: 'Contato',
          userRole: 'Usuário',
        });
      },
    });
  }

  private abrirComParceiro(userId: number, partnerInfo: { userName: string; userRole: string; userFoto?: string }) {
    this.chatService.openConversation(userId, partnerInfo);
    this.shouldScroll = true;
    this.shouldFocusInput = true;
  }

  fecharConversa() {
    this.chatService.closeConversation();
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
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

  irParaPerfil(conv: Conversation | null) {
    if (!conv || !this.isPaciente()) return;
    this.router.navigate(['/painel/perfil-profissional', conv.userId]);
  }

  inicialAvatar(nome: string): string {
    return nome ? nome.charAt(0).toUpperCase() : '?';
  }

  onFotoErro(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const parent = img.parentElement;
    if (parent && !parent.querySelector('span')) {
      const nome = img.alt || '?';
      const span = document.createElement('span');
      span.textContent = this.inicialAvatar(nome);
      parent.appendChild(span);
    }
  }

  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch { }
  }
}
