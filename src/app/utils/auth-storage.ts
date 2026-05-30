export const AUTH_KEYS = {
  token: 'sigps_auth',
  user: 'sigps_user',
  activeOrg: 'sigps_active_org',
  orgsCache: 'sigps_cached_orgs',
  savedEmail: 'sigps_saved_email',
  rememberMe: 'sigps_remember_me',
} as const;

function hasStorage(): boolean {
  return typeof localStorage !== 'undefined' && typeof sessionStorage !== 'undefined';
}

export function getAuthStorage(): Storage | null {
  if (!hasStorage()) return null;
  if (localStorage.getItem(AUTH_KEYS.token)) return localStorage;
  if (sessionStorage.getItem(AUTH_KEYS.token)) return sessionStorage;
  return localStorage;
}

export function getStoredToken(): string | null {
  if (!hasStorage()) return null;
  return localStorage.getItem(AUTH_KEYS.token) ?? sessionStorage.getItem(AUTH_KEYS.token);
}

export function getStoredUser<T>(): T | null {
  const storage = getAuthStorage();
  if (!storage) return null;
  const raw = storage.getItem(AUTH_KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearAuthData(): void {
  if (!hasStorage()) return;
  for (const key of Object.values(AUTH_KEYS)) {
    if (key === AUTH_KEYS.savedEmail || key === AUTH_KEYS.rememberMe) continue;
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
}

export function persistAuthData(
  token: string,
  userJson: string,
  rememberMe: boolean,
  extra?: { activeOrg?: string; orgsCache?: string }
): Storage | null {
  if (!hasStorage()) return null;

  clearAuthData();
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(AUTH_KEYS.token, token);
  storage.setItem(AUTH_KEYS.user, userJson);
  if (extra?.activeOrg) storage.setItem(AUTH_KEYS.activeOrg, extra.activeOrg);
  if (extra?.orgsCache) storage.setItem(AUTH_KEYS.orgsCache, extra.orgsCache);
  return storage;
}

export function loadRememberPreferences(): { rememberMe: boolean; savedEmail: string } {
  if (!hasStorage()) return { rememberMe: false, savedEmail: '' };
  return {
    rememberMe: localStorage.getItem(AUTH_KEYS.rememberMe) === 'true',
    savedEmail: localStorage.getItem(AUTH_KEYS.savedEmail) || '',
  };
}

export function saveRememberPreferences(rememberMe: boolean, email: string): void {
  if (!hasStorage()) return;
  localStorage.setItem(AUTH_KEYS.rememberMe, rememberMe ? 'true' : 'false');
  if (rememberMe && email.trim()) {
    localStorage.setItem(AUTH_KEYS.savedEmail, email.trim());
  } else {
    localStorage.removeItem(AUTH_KEYS.savedEmail);
  }
}

export function readActiveOrgId(): number | null {
  const storage = getAuthStorage();
  if (!storage) return null;
  const saved = storage.getItem(AUTH_KEYS.activeOrg);
  if (saved === null) return null;
  const parsed = parseInt(saved, 10);
  return isNaN(parsed) ? null : parsed;
}

export function writeActiveOrgId(orgId: number, storage?: Storage | null): void {
  const target = storage ?? getAuthStorage();
  if (!target) return;
  target.setItem(AUTH_KEYS.activeOrg, orgId.toString());
}

export function readOrgsCache(): any[] | null {
  const storage = getAuthStorage();
  if (!storage) return null;
  const raw = storage.getItem(AUTH_KEYS.orgsCache);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeOrgsCache(data: any[], storage?: Storage | null): void {
  const target = storage ?? getAuthStorage();
  if (!target) return;
  target.setItem(AUTH_KEYS.orgsCache, JSON.stringify(data));
}
