import { Pipe, PipeTransform } from '@angular/core';
import { AvatarOptions, resolveAvatarUrl } from '../utils/media-url';

@Pipe({ name: 'avatarUrl', standalone: true })
export class AvatarUrlPipe implements PipeTransform {
  transform(foto?: string | null, nome?: string | null, size?: number): string {
    const options: AvatarOptions = {};
    if (size) options.size = size;
    return resolveAvatarUrl(foto, nome, options);
  }
}
