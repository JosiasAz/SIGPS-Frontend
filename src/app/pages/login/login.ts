import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AbstractAuthService } from '../../services/auth/abstract-auth.service';
import { loadRememberPreferences } from '../../utils/auth-storage';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AbstractAuthService);

  credentials = {
    email: '',
    password: ''
  };

  showPassword = signal(false);
  rememberMe = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  isAccountDisabled = signal(false);
  blockedAccountName = signal('');

  ngOnInit() {
    const prefs = loadRememberPreferences();
    this.rememberMe.set(prefs.rememberMe);
    if (prefs.savedEmail) {
      this.credentials.email = prefs.savedEmail;
    }

    this.route.queryParamMap.subscribe(params => {
      if (params.get('registered') === 'true') {
        this.successMessage.set('Conta criada com sucesso! Faça login para continuar.');
      }
    });
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  onLogin(event: Event) {
    event.preventDefault();

    if (!this.credentials.email.trim()) {
      this.errorMessage.set('O campo de e-mail é obrigatório.');
      return;
    }

    if (!this.credentials.password) {
      this.errorMessage.set('A senha não pode estar vazia.');
      return;
    }

    if (this.credentials.password.length < 6) {
      this.errorMessage.set('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isAccountDisabled.set(false);

    this.authService.login({
      email: this.credentials.email.trim(),
      password: this.credentials.password,
      rememberMe: this.rememberMe(),
    }).subscribe({
      next: () => {
        this.router.navigate(['/painel']);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err?.code === 'ACCOUNT_DISABLED') {
          this.isAccountDisabled.set(true);
          this.blockedAccountName.set(err.nome || 'seu perfil');
        } else {
          this.errorMessage.set(err.error?.message || 'Falha ao entrar. Verifique seus dados.');
        }
      }
    });
  }
}
