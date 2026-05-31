import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../env/environment';
import { API_ENDPOINTS } from '../../config/endpoints';

@Component({
  selector: 'app-redefinir-senha',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './redefinir-senha.html',
  styleUrls: ['../login/login.scss', './redefinir-senha.scss'],
})
export class RedefinirSenhaComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  token = signal('');
  password = signal('');
  confirmPassword = signal('');
  showPassword = signal(false);
  isLoading = signal(false);
  validating = signal(true);
  tokenValid = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  ngOnInit() {
    const fromUrl = this.readTokenFromWindow();
    this.route.queryParamMap.subscribe(params => {
      const t = params.get('token') || fromUrl || '';
      this.token.set(t);
      if (!t) {
        this.validating.set(false);
        this.errorMessage.set('Link inválido ou incompleto. Solicite uma nova redefinição de senha.');
        return;
      }
      this.validateToken(t);
    });
  }

  /** Fallback quando a rota Angular ainda não leu query params (ex.: após redirect SPA). */
  private readTokenFromWindow(): string {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    return params.get('token') || '';
  }

  private validateToken(token: string) {
    this.validating.set(true);
    this.errorMessage.set('');

    this.http.get<{ valid: boolean; message?: string }>(
      `${environment.apiUrl}${API_ENDPOINTS.AUTH.RESET_PASSWORD_VALIDATE}`,
      { params: { token } }
    ).subscribe({
      next: (res) => {
        this.validating.set(false);
        if (res.valid) {
          this.tokenValid.set(true);
        } else {
          this.tokenValid.set(false);
          this.errorMessage.set(res.message || 'Link inválido ou expirado.');
        }
      },
      error: (err) => {
        this.validating.set(false);
        // API antiga sem /validate — permite tentar redefinir no submit
        if (err.status === 404 || err.status === 0) {
          this.tokenValid.set(true);
          return;
        }
        this.tokenValid.set(false);
        this.errorMessage.set(
          err.error?.message || 'Não foi possível validar o link. Solicite um novo e-mail.'
        );
      },
    });
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  passwordStrength(): 'fraca' | 'media' | 'forte' {
    const p = this.password();
    if (p.length < 6) return 'fraca';
    if (p.length >= 10 && /[A-Z]/.test(p) && /[0-9]/.test(p)) return 'forte';
    return 'media';
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (!this.token() || !this.tokenValid()) return;

    if (this.password().length < 6) {
      this.errorMessage.set('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set('As senhas não coincidem.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.http.post<{ message: string }>(
      `${environment.apiUrl}${API_ENDPOINTS.AUTH.RESET_PASSWORD}`,
      { token: this.token(), senha: this.password() }
    ).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set(res.message || 'Senha redefinida com sucesso!');
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Não foi possível redefinir a senha. O link pode ter expirado.');
      },
    });
  }
}
