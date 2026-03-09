import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AbstractAuthService } from '../../services/auth/abstract-auth.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.scss',
})
export class Cadastro {
  private router = inject(Router);
  private authService = inject(AbstractAuthService);

  userData = {
    nome: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPassword() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  onRegister(event: Event) {
    event.preventDefault();

    if (this.userData.password !== this.userData.confirmPassword) {
      this.errorMessage.set('As senhas não coincidem.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.register(this.userData).subscribe({
      next: () => {
        this.router.navigate(['/painel']);
      },
      error: (err) => {
        this.errorMessage.set('Erro ao criar conta. Tente novamente.');
        this.isLoading.set(false);
      }
    });
  }
}
