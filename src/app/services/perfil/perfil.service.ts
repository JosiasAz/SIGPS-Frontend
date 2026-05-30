import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../env/environment';
import { cacheGet, cacheSet, cacheInvalidate } from '../../utils/api-cache';

const CACHE_KEY = 'perfil:me';
const TTL_MS = 5 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  perfil = signal<Record<string, unknown> | null>(null);

  getMe(force = false): Observable<Record<string, unknown>> {
    const cached = !force ? cacheGet<Record<string, unknown>>(CACHE_KEY, { session: true }) : null;

    const fetch$ = this.http.get<Record<string, unknown>>(`${this.apiUrl}/api/v1/perfil/me`).pipe(
      tap(p => {
        cacheSet(CACHE_KEY, p, TTL_MS, { session: true });
        this.perfil.set(p);
      })
    );

    if (cached) {
      this.perfil.set(cached);
      fetch$.subscribe({ error: () => { /* mantém cache em falha de rede */ } });
      return of(cached);
    }

    return fetch$;
  }

  invalidate(): void {
    cacheInvalidate('perfil:');
    this.perfil.set(null);
  }

  patchMe(body: unknown): Observable<unknown> {
    return this.http.patch(`${this.apiUrl}/api/v1/perfil/me`, body).pipe(
      tap(() => this.invalidate())
    );
  }
}
