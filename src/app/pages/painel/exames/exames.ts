import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-exames',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './exames.html',
  styleUrls: ['../painel.scss', './exames.scss']
})
export class ExamesComponent {
  exames = [
    { title: 'Hemograma Completo', date: '10/11/2026', doctor: 'Dra. Luiza Souza', status: 'Disponível', type: 'Sangue' },
    { title: 'Raio-X do Tórax', date: '05/10/2026', doctor: 'Dr. Roberto Lins', status: 'Disponível', type: 'Imagem' },
    { title: 'Eletrocardiograma (ECG)', date: '15/09/2026', doctor: 'Dr. Carlos Renato', status: 'Disponível', type: 'Exame' },
  ];
}
