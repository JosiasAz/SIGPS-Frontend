import { Component, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AbstractAuthService } from '../../../services/auth/abstract-auth.service';

@Component({
  selector: 'app-portal-paciente',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './portal-paciente.html',
  styleUrl: './portal-paciente.scss',
})
export class PortalPacienteComponent {
  private authService = inject(AbstractAuthService);

  patientName = computed(() => {
    const user = this.authService.currentUser();
    if (!user || !user.name) return 'Paciente';
    return user.name.split(' ')[0];
  });

  // MOCK DATA
  upcomingAppointment = signal<{
    month: string;
    day: string;
    title: string;
    doctor: string;
    location: string;
    time: string;
    receptionTime: string;
  } | null>({
    month: 'NOV',
    day: '12',
    title: 'Cardiologista - Avaliação de Rotina',
    doctor: 'Dr. Carlos Renato',
    location: 'Unidade Central SIGPS',
    time: '14:30',
    receptionTime: '14:15'
  });

  metrics = signal({
    completedExams: 2,
    unreadMessages: 1
  });
}
