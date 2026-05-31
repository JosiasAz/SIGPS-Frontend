import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-documentacao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documentacao.html',
  styleUrl: './documentacao.scss',
})
export class DocumentacaoComponent {
  activeSection = 'visao-geral';

  sections = [
    { id: 'visao-geral', label: 'Visão Geral', icon: '📋' },
    { id: 'arquitetura', label: 'Arquitetura', icon: '🏗️' },
    { id: 'tecnologias', label: 'Tecnologias', icon: '⚙️' },
    { id: 'casos-uso', label: 'Casos de Uso', icon: '👤' },
    { id: 'banco-dados', label: 'Banco de Dados', icon: '🗄️' },
    { id: 'ia', label: 'Módulo de IA', icon: '🤖' },
    { id: 'api', label: 'Endpoints da API', icon: '🔌' },
  ];

  setActiveSection(id: string) {
    this.activeSection = id;
  }
}
