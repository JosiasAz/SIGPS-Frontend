import { Directive, HostListener, Input } from '@angular/core';
import { applyAvatarFallback } from '../utils/media-url';

@Directive({ selector: 'img[avatarFallback]', standalone: true })
export class AvatarFallbackDirective {
  @Input('avatarFallback') nome = 'Usuário';
  @Input() avatarSize?: number;

  @HostListener('error', ['$event'])
  onError(event: Event): void {
    applyAvatarFallback(event.target as HTMLImageElement, this.nome, {
      size: this.avatarSize,
    });
  }
}
