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

  toggleGeneroDropdown() {
    this.isGeneroDropdownOpen.set(!this.isGeneroDropdownOpen());
  }

  selecionarGenero(valor: string) {
    this.userData.genero = valor;
    this.isGeneroDropdownOpen.set(false);
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

  onRegister(event: Event) {
    event.preventDefault();
    this.errorMessage.set('');

    const nomeCompleto = this.userData.nome.trim();
    if (nomeCompleto.split(' ').length < 2) {
      this.errorMessage.set('Por favor, insira seu nome completo.');
      return;
    }

    if (!this.userData.cpf || !this.validateCPF(this.userData.cpf)) {
      this.errorMessage.set('CPF inválido. Insira um CPF válido.');
      return;
    }

    if (!this.userData.password) {
      this.errorMessage.set('A senha não pode estar vazia.');
      return;
    }

    if (this.userData.password.length < 6) {
      this.errorMessage.set('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (this.userData.password !== this.userData.confirmPassword) {
      this.errorMessage.set('As senhas não coincidem.');
      return;
    }

    if (!this.userData.genero) {
      this.errorMessage.set('Por favor, selecione seu gênero.');
      return;
    }

    if (!this.userData.dataNascimento || this.userData.dataNascimento.length < 10) {
      this.errorMessage.set('Por favor, insira sua data de nascimento.');
      return;
    }

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
