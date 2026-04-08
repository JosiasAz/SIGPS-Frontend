import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AbstractAuthService } from '../../../services/auth/abstract-auth.service';

@Component({
  selector: 'app-perfil-profissional',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './perfil-profissional.html',
  styleUrls: ['./perfil-profissional.scss'],
})
export class PerfilProfissionalComponent {
  private route = inject(ActivatedRoute);
  private authService = inject(AbstractAuthService);

  userRole = this.authService.userRole;
  isPaciente = computed(() => this.userRole() === 'paciente');

  // Mock data — professional profile
  profissional = {
    id: 1,
    nome: 'Dr. Roberto Lins',
    especialidade: 'Cardiologia Clínica e Esportiva',
    crm: 'CRM 12345-SP',
    avaliacao: 4.9,
    avaliacoesCount: 128,
    consultasRealizadas: 1842,
    anosExperiencia: 12,
    taxaRetorno: 94,
    sobre: 'Especialista em cardiologia esportiva com mais de 12 anos de experiência clínica. Foco no acompanhamento de atletas de alta performance e avaliações rigorosas de risco cardiovascular. Membro da Sociedade Brasileira de Cardiologia.',
    formacao: [
      { titulo: 'Residência em Cardiologia', instituicao: 'InCor - HC/FMUSP', ano: '2014' },
      { titulo: 'Medicina', instituicao: 'Universidade de São Paulo (USP)', ano: '2012' }
    ],
    servicos: ['Consulta Cardiológica', 'Eletrocardiograma (ECG)', 'Risco Cirúrgico', 'Teste Ergométrico', 'Holter 24h', 'MAPA'],
    avaliacoes: [
      { nome: 'Maria S.', nota: 5, texto: 'Médico muito atencioso e competente. Explica tudo com calma.', data: 'Há 2 semanas' },
      { nome: 'Carlos R.', nota: 5, texto: 'Acompanhamento excelente. Me sinto seguro sendo atendido por ele.', data: 'Há 1 mês' },
      { nome: 'Ana P.', nota: 4, texto: 'Ótimo profissional! Consultório limpo e organizado.', data: 'Há 2 meses' }
    ],
    foto: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1000&auto=format&fit=crop',
    banner: 'https://images.unsplash.com/photo-1551076805-e1869043e560?q=80&w=2670&auto=format&fit=crop'
  };

  // Stats for the professional's own dashboard view
  estatisticas = signal({
    pacientesHoje: 8,
    consultasMes: 42,
    faturamentoMes: 'R$ 18.900',
    satisfacao: '98%'
  });

  agendaHoje = signal([
    { hora: '08:00', paciente: 'Maria Santos', tipo: 'Retorno', status: 'confirmado' },
    { hora: '09:00', paciente: 'Carlos Ribeiro', tipo: 'Primeira Consulta', status: 'confirmado' },
    { hora: '10:30', paciente: 'Ana Paula Costa', tipo: 'ECG', status: 'aguardando' },
    { hora: '14:00', paciente: 'João Silva', tipo: 'Risco Cirúrgico', status: 'confirmado' },
    { hora: '15:30', paciente: 'Fernanda Lima', tipo: 'Retorno', status: 'aguardando' },
  ]);

  diasDisponiveis = [
    { data: 'Hoje', diasemana: 'Qui', slots: ['14:00', '15:30', '16:00'] },
    { data: 'Amanhã', diasemana: 'Sex', slots: ['09:00', '10:00', '14:30', '17:00'] },
    { data: '10/04', diasemana: 'Seg', slots: ['08:00', '11:00', '13:00', '15:00'] }
  ];

  selectedSlot = signal<{ dia: string; slot: string } | null>(null);

  selecionarHorario(dia: string, slot: string) {
    this.selectedSlot.set({ dia, slot });
  }

  confirmarAgendamento() {
    const sel = this.selectedSlot();
    if (sel) {
      alert(`✅ Agendamento confirmado!\n${sel.dia} às ${sel.slot} com ${this.profissional.nome}`);
      this.selectedSlot.set(null);
    }
  }

  cancelarSelecao() {
    this.selectedSlot.set(null);
  }
}
