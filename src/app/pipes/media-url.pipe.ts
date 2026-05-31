import { Pipe, PipeTransform } from '@angular/core';
import { resolveMediaUrl } from '../utils/media-url';

@Pipe({ name: 'mediaUrl', standalone: true })
export class MediaUrlPipe implements PipeTransform {
  transform(url?: string | null): string {
    return resolveMediaUrl(url);
  }
}
