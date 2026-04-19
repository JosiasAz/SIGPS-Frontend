import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AbstractEspecialistasService } from '../../../services/especialistas/abstract-especialistas.service';

@Component({
  selector: 'app-busca-profissionais',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './busca-profissionais.html',
  styleUrls: ['./busca-profissionais.scss']
})
export class BuscaProfissionaisComponent {
  private especialistasService = inject(AbstractEspecialistasService);
  
  searchQuery = signal('');
  selectedEspecialidade = signal('Todas');

  especialidades = ['Todas', 'Cardiologia', 'Dermatologia', 'Pediatria', 'Ortopedia', 'Neurologia', 'Psiquiatria'];

  profissionaisFiltrados = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const especialidade = this.selectedEspecialidade();
    const especialistas = this.especialistasService.especialistas();

    return especialistas.filter(p => {
      const matchQuery = p.nome.toLowerCase().includes(query) || p.especialidade.toLowerCase().includes(query);
      const matchEspecialidade = especialidade === 'Todas' || (especialidade === 'Cardiologia' && p.especialidade.includes('Cardiologia')) || p.especialidade === especialidade;
      return matchQuery && matchEspecialidade;
    });
  });

  setEspecialidade(esp: string) {
    this.selectedEspecialidade.set(esp);
  }
}
