import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AbstractAuthService } from '../../services/auth/abstract-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private router = inject(Router);
  private authService = inject(AbstractAuthService);

  credentials = {
    email: '',
    password: ''
  };

  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

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

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['/painel']);
      },
      error: (err) => {
        this.errorMessage.set('Falha ao entrar. Verifique seus dados.');
        this.isLoading.set(false);
      }
    });
  }
}
