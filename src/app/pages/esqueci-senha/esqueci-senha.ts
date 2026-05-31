import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../env/environment';
import { API_ENDPOINTS } from '../../config/endpoints';

@Component({
  selector: 'app-esqueci-senha',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './esqueci-senha.html',
  styleUrls: ['../login/login.scss', './esqueci-senha.scss'],
})
export class EsqueciSenhaComponent implements OnInit {
  private http = inject(HttpClient);

  email = signal('');
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  ngOnInit() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('sigps_saved_email');
      if (saved) this.email.set(saved);
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    const value = this.email().trim();
    if (!value) {
      this.errorMessage.set('Informe seu e-mail.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.http.post<{ message: string }>(
      `${environment.apiUrl}${API_ENDPOINTS.AUTH.FORGOT_PASSWORD}`,
      { email: value }
    ).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set(
          res.message || 'Se o e-mail estiver cadastrado, você receberá instruções em instantes.'
        );
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Não foi possível enviar o e-mail. Tente novamente.');
      },
    });
  }
}
