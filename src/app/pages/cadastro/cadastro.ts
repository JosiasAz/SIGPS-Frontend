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
    cpf: '',
    genero: '',
    dataNascimento: '',
    password: '',
    confirmPassword: ''
  };

  aceitouTermos = signal(false);
  mostrarTermos = signal(false);

  showPassword = signal(false);
  showConfirmPassword = signal(false);
  showDatePicker = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  isGeneroDropdownOpen = signal(false);

  opcoesGenero = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'feminino', label: 'Feminino' },
    { value: 'homem-trans', label: 'Homem Trans' },
    { value: 'mulher-trans', label: 'Mulher Trans' },
    { value: 'outro', label: 'Outro' },
    { value: 'prefiro-nao', label: 'Prefiro não informar' },
  ];

  fieldErrors = {
    nome: signal(''),
    email: signal(''),
    cpf: signal(''),
    genero: signal(''),
    dataNascimento: signal(''),
    password: signal(''),
    confirmPassword: signal('')
  };

  private touched: Record<string, boolean> = {};

  toggleGeneroDropdown() {
    this.isGeneroDropdownOpen.set(!this.isGeneroDropdownOpen());
  }

  selecionarGenero(valor: string) {
    this.userData.genero = valor;
    this.isGeneroDropdownOpen.set(false);
    this.onBlur('genero');
  }

  getGeneroLabel(): string {
    const selecionado = this.opcoesGenero.find(o => o.value === this.userData.genero);
    if (!selecionado) return 'Selecione';

    switch (selecionado.value) {
      case 'masculino': return 'Masculino';
      case 'feminino': return 'Feminino';
      case 'homem-trans': return 'H. Trans';
      case 'mulher-trans': return 'M. Trans';
      case 'outro': return 'Outro';
      case 'prefiro-nao': return 'P. N. I.';
      default: return selecionado.label;
    }
  }

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPassword() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  toggleDatePicker() {
    this.showDatePicker.set(!this.showDatePicker());
  }

  formatDate(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 8) {
      value = value.substring(0, 8);
    }

    if (value.length > 4) {
      value = value.replace(/(\d{2})(\d{2})(\d{4})/, "$1/$2/$3");
    } else if (value.length > 2) {
      value = value.replace(/(\d{2})(\d{2})/, "$1/$2");
    }

    input.value = value;
    this.userData.dataNascimento = value;
  }

  formatCpf(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 11) {
      value = value.substring(0, 11);
    }

    if (value.length > 9) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (value.length > 6) {
      value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    } else if (value.length > 3) {
      value = value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    }

    input.value = value;
    this.userData.cpf = value;
  }

  validateCPF(cpf: string): boolean {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf === '' || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    let add = 0;
    for (let i = 0; i < 9; i++) {
        add += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(9))) return false;

    add = 0;
    for (let i = 0; i < 10; i++) {
        add += parseInt(cpf.charAt(i)) * (11 - i);
    }
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(10))) return false;

    return true;
  }

  onBlur(field: string) {
    this.touched[field] = true;
    this.runValidation(field);
  }

  onPasswordInput() {
    if (this.touched['confirmPassword']) {
      this.runValidation('confirmPassword');
    }
  }

  onConfirmPasswordInput() {
    if (this.touched['confirmPassword']) {
      this.runValidation('confirmPassword');
    }
  }

  private runValidation(field: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    switch (field) {
      case 'nome':
        this.fieldErrors.nome.set(
          this.userData.nome.trim().split(' ').filter(Boolean).length < 2
            ? 'Insira seu nome completo.' : ''
        );
        break;
      case 'email':
        this.fieldErrors.email.set(
          !this.userData.email || !emailRegex.test(this.userData.email)
            ? 'Insira um e-mail válido.' : ''
        );
        break;
      case 'cpf':
        this.fieldErrors.cpf.set(
          !this.validateCPF(this.userData.cpf) ? 'CPF inválido.' : ''
        );
        break;
      case 'genero':
        this.fieldErrors.genero.set(
          !this.userData.genero ? 'Selecione seu gênero.' : ''
        );
        break;
      case 'dataNascimento':
        this.fieldErrors.dataNascimento.set(
          !this.userData.dataNascimento || this.userData.dataNascimento.length < 10
            ? 'Insira sua data de nascimento.' : ''
        );
        break;
      case 'password':
        this.fieldErrors.password.set(
          !this.userData.password ? 'A senha não pode estar vazia.' :
          this.userData.password.length < 6 ? 'Mínimo 6 caracteres.' : ''
        );
        if (this.touched['confirmPassword']) {
          this.runValidation('confirmPassword');
        }
        break;
      case 'confirmPassword':
        this.fieldErrors.confirmPassword.set(
          !this.userData.confirmPassword ? 'Confirme sua senha.' :
          this.userData.password !== this.userData.confirmPassword
            ? 'As senhas não coincidem.' : ''
        );
        break;
    }
  }

  onRegister(event: Event) {
    event.preventDefault();
    this.errorMessage.set('');

    const fields = ['nome', 'email', 'cpf', 'genero', 'dataNascimento', 'password', 'confirmPassword'];
    fields.forEach(f => {
      this.touched[f] = true;
      this.runValidation(f);
    });

    const hasErrors = Object.values(this.fieldErrors).some(s => s() !== '');
    if (hasErrors) return;

    if (!this.aceitouTermos()) {
      this.errorMessage.set('Você precisa aceitar os Termos de Uso e a Política de Privacidade.');
      return;
    }

    const [dia, mes, ano] = this.userData.dataNascimento.split('/');
    const dataNascimentoISO = `${ano}-${mes}-${dia}`;

    const { confirmPassword, dataNascimento, ...rest } = this.userData;
    const payload = { ...rest, data_nascimento: dataNascimentoISO, aceitou_termos: true };

    this.isLoading.set(true);

    this.authService.register(payload).subscribe({
      next: () => {
        this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Erro ao criar conta. Tente novamente.');
        this.isLoading.set(false);
      }
    });
  }
}
