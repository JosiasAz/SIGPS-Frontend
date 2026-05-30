import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AbstractAuthService } from '../../../services/auth/abstract-auth.service';
import { AbstractAgendasService } from '../../../services/agendas/abstract-agendas.service';
import { AgendasService } from '../../../services/agendas/agendas.service';
import { AbstractExamesService } from '../../../services/exames/abstract-exames.service';
import { ExamesService } from '../../../services/exames/exames.service';
import { AbstractChatService } from '../../../services/chat/abstract-chat.service';

@Component({
  selector: 'app-portal-paciente',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './portal-paciente.html',
  styleUrl: './portal-paciente.scss',
})
export class PortalPacienteComponent implements OnInit {
  private authService = inject(AbstractAuthService);
  private agendasService = inject(AbstractAgendasService);
  private examesService = inject(AbstractExamesService);
  private chatService = inject(AbstractChatService);

  patientName = computed(() => {
    const user = this.authService.currentUser();
    if (!user || !user.name) return 'Paciente';
    return user.name.split(' ')[0];
  });

  upcomingAppointment = computed(() => {
    const consulta = this.agendasService.getProximaConsulta();
    if (!consulta) return null;

    const [dia, mes, ano] = consulta.data.split('/');
    const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    
    return {
      month: meses[parseInt(mes) - 1] || '---',
      day: dia,
      title: consulta.especialidade,
      doctor: consulta.especialista,
      location: consulta.local,
      time: consulta.horario,
      receptionTime: '15 min antes' // Simulação
    };
  });

  ngOnInit() {
    (this.agendasService as AgendasService).loadAll();
    (this.examesService as ExamesService).loadExames();
  }

  metrics = computed(() => {
    return {
      completedExams: this.examesService.examesCount(),
      unreadMessages: this.chatService.unreadCount()
    };
  });
}
