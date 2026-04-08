import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-busca-profissionais',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './busca-profissionais.html',
  styleUrls: ['./busca-profissionais.scss']
})
export class BuscaProfissionaisComponent {
  searchQuery = signal('');
  selectedEspecialidade = signal('Todas');

  especialidades = ['Todas', 'Cardiologia', 'Dermatologia', 'Pediatria', 'Ortopedia', 'Neurologia', 'Psiquiatria'];

  profissionaisMock = [
    { id: 1, nome: 'Dr. Roberto Lins', especialidade: 'Cardiologia Clínica e Esportiva', crm: '12345-SP', avaliacao: 4.9, avaliacoesCount: 128, foto: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1000&auto=format&fit=crop', proximaVaga: 'Hoje, 14:00' },
    { id: 2, nome: 'Dra. Amanda Silva', especialidade: 'Dermatologia', crm: '54321-SP', avaliacao: 4.8, avaliacoesCount: 95, foto: 'https://images.unsplash.com/photo-1594824432258-0ceea5e894aa?q=80&w=1000&auto=format&fit=crop', proximaVaga: 'Amanhã, 09:00' },
    { id: 3, nome: 'Dr. Carlos Mendes', especialidade: 'Pediatria', crm: '98765-SP', avaliacao: 5.0, avaliacoesCount: 210, foto: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=1000&auto=format&fit=crop', proximaVaga: 'Dia 12/04, 10:30' },
    { id: 4, nome: 'Dra. Julia Costa', especialidade: 'Ortopedia', crm: '45678-RJ', avaliacao: 4.7, avaliacoesCount: 84, foto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1000&auto=format&fit=crop', proximaVaga: 'Hoje, 16:30' },
    { id: 5, nome: 'Dr. Fernando Lima', especialidade: 'Neurologia', crm: '33445-MG', avaliacao: 4.9, avaliacoesCount: 156, foto: 'https://ui-avatars.com/api/?name=Fernando+Lima&background=419640&color=fff&size=200', proximaVaga: 'Dia 15/04, 08:00' },
    { id: 6, nome: 'Dra. Mariana Alves', especialidade: 'Psiquiatria', crm: '11223-SP', avaliacao: 4.8, avaliacoesCount: 112, foto: 'https://ui-avatars.com/api/?name=Mariana+Alves&background=419640&color=fff&size=200', proximaVaga: 'Amanhã, 14:00' }
  ];

  profissionaisFiltrados = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const especialidade = this.selectedEspecialidade();

    return this.profissionaisMock.filter(p => {
      const matchQuery = p.nome.toLowerCase().includes(query) || p.especialidade.toLowerCase().includes(query);
      const matchEspecialidade = especialidade === 'Todas' || (especialidade === 'Cardiologia' && p.especialidade.includes('Cardiologia')) || p.especialidade === especialidade;
      return matchQuery && matchEspecialidade;
    });
  });

  setEspecialidade(esp: string) {
    this.selectedEspecialidade.set(esp);
  }
}
