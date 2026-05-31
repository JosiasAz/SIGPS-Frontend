import { environment } from '../env/environment';

export interface AvatarOptions {
  size?: number;
  background?: string;
  bold?: boolean;
}

const DEFAULT_AVATAR_BG = '419640';

/** Avatar gerado a partir do nome (ui-avatars). */
export function defaultAvatarUrl(nome?: string | null, options: AvatarOptions = {}): string {
  const name = encodeURIComponent((nome || 'Usuário').trim() || 'Usuário');
  const size = options.size ?? 200;
  const bg = options.background ?? DEFAULT_AVATAR_BG;
  const bold = options.bold ? '&bold=true' : '';
  return `https://ui-avatars.com/api/?name=${name}&background=${bg}&color=fff&size=${size}${bold}`;
}

/** Converte caminhos relativos da API (/api/v1/perfil/foto/...) em URL absoluta do backend. */
export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (
    url.startsWith('blob:') ||
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  const base = environment.apiUrl.replace(/\/$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}

/** URL da foto do perfil ou avatar padrão quando não houver imagem. */
export function resolveAvatarUrl(
  foto?: string | null,
  nome?: string | null,
  options: AvatarOptions = {}
): string {
  const media = resolveMediaUrl(foto);
  return media || defaultAvatarUrl(nome, options);
}

/** Usado no handler (error) de <img> para trocar por avatar padrão. */
export function applyAvatarFallback(img: HTMLImageElement, nome?: string | null, options: AvatarOptions = {}): void {
  const fallback = defaultAvatarUrl(nome, options);
  if (img.src === fallback) return;
  img.onerror = null;
  img.src = fallback;
}
