import { Component, inject, ViewChild, ElementRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AbstractPacientesService, Paciente } from '../../../services/pacientes/abstract-pacientes.service';
import { AbstractAgendasService } from '../../../services/agendas/abstract-agendas.service';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pacientes.html',
  styleUrls: ['../painel.scss'],
})
export class PacientesComponent {
  private pacientesService = inject(AbstractPacientesService);
  private agendasService = inject(AbstractAgendasService);
  private fb = inject(FormBuilder);

  @ViewChild('addModal') addModal!: ElementRef<HTMLDialogElement>;
  @ViewChild('deleteModal') deleteModal!: ElementRef<HTMLDialogElement>;

  // Lista mesclada: pacientes cadastrados + derivados das consultas da agenda
  pacientes = computed(() => {
    const cadastrados = this.pacientesService.pacientes();
    const consultas = this.agendasService.consultas();

    // Gera pacientes "automáticos" a partir das consultas agendadas
    const daCAgenda: (Paciente & { origem: string })[] = consultas
      .filter(c => c.pacienteNome) // Só mostra se tiver nome
      .map((c, i) => ({
        id: c.pacienteId || (9000 + i),
        nome: c.pacienteNome!,
        cpf: '—',
        ultimaConsulta: c.data,
        especialidade: c.especialidade,
        origem: 'agenda'
      }));

    // Combina, removendo duplicatas por nome (mock simples)
    const cadastradosComOrigem = cadastrados.map(p => ({ ...p, origem: 'manual' }));
    return [...cadastradosComOrigem, ...daCAgenda];
  });

  // Manter referência separada para o service CRUD (só pacientes manuais)
  pacientesManuais = this.pacientesService.pacientes;

  deletingPacienteId: number | null = null;
  deletingPacienteNome: string = '';
  pacienteForm: FormGroup;
  editingPacienteId: number | null = null;

  constructor() {
    this.pacienteForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      especialidade: ['', Validators.required]
    });

    // Setup formatação automática de CPF
    this.pacienteForm.get('cpf')?.valueChanges.subscribe(value => {
      this.onCpfInput(value);
    });
  }

  /**
   * Formata o CPF automaticamente enquanto o usuário digita apenas números
   * Exemplo: 12345678900 -> 123.456.789-00
   */
  private formatCPF(value: string): string {
    // Remove tudo que não é número
    const numeros = value.replace(/\D/g, '');

    // Limita a 11 dígitos
    const limitado = numeros.slice(0, 11);

    // Formata no padrão XXX.XXX.XXX-XX
    if (limitado.length <= 3) {
      return limitado;
    } else if (limitado.length <= 6) {
      return limitado.replace(/(\d{3})(\d+)/, '$1.$2');
    } else if (limitado.length <= 9) {
      return limitado.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    } else {
      return limitado.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
  }

  /**
   * Manipula o evento de input do CPF
   */
  onCpfInput(value: string): void {
    if (!value) return;

    const formatted = this.formatCPF(value);

    // Apenas atualiza se o valor formatado é diferente
    if (formatted !== value) {
      // Usa setValue com emitEvent: false para evitar loop infinito
      this.pacienteForm.get('cpf')?.setValue(formatted, { emitEvent: false });
    }
  }

  abrirModal(): void {
    this.addModal.nativeElement.showModal();
  }

  fecharModal(): void {
    this.addModal.nativeElement.close();
    this.pacienteForm.reset();
    this.editingPacienteId = null;
  }

  salvarPaciente(): void {
    if (this.pacienteForm.valid) {
      const formValue = this.pacienteForm.value;
      
      if (this.editingPacienteId !== null) {
        // Atualiza paciente existente
        const pacienteAtualizado: Partial<Paciente> = {
          nome: formValue.nome,
          cpf: formValue.cpf,
          especialidade: formValue.especialidade
        };
        this.pacientesService.atualizarPaciente(this.editingPacienteId, pacienteAtualizado);
      } else {
        // Adiciona novo paciente
        const novoPaciente = {
          nome: formValue.nome,
          cpf: formValue.cpf,
          ultimaConsulta: 'Nunca', // Novo paciente ainda não teve consulta
          especialidade: formValue.especialidade
        };
        this.pacientesService.adicionarPaciente(novoPaciente);
      }
      
      this.fecharModal();
    } else {
      // Marcar todos os campos como touched para mostrar erros
      Object.keys(this.pacienteForm.controls).forEach(key => {
        this.pacienteForm.get(key)?.markAsTouched();
      });
    }
  }

  editarPaciente(paciente: Paciente): void {
    this.editingPacienteId = paciente.id;
    this.pacienteForm.patchValue({
      nome: paciente.nome,
      cpf: paciente.cpf,
      especialidade: paciente.especialidade
    });
    this.abrirModal();
  }

  excluirPaciente(id: number, nome: string): void {
    this.deletingPacienteId = id;
    this.deletingPacienteNome = nome;
    this.deleteModal.nativeElement.showModal();
  }

  fecharModalExclusao(): void {
    this.deleteModal.nativeElement.close();
    this.deletingPacienteId = null;
    this.deletingPacienteNome = '';
  }

  confirmarExclusao(): void {
    if (this.deletingPacienteId !== null) {
      this.pacientesService.excluirPaciente(this.deletingPacienteId);
      this.fecharModalExclusao();
    }
  }

  // Método antigo mantido para compatibilidade, mas agora abre o modal
  adicionarPaciente(): void {
    this.abrirModal();
  }
}
