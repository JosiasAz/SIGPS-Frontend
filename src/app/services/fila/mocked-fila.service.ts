import { Injectable, signal } from '@angular/core';
import { AbstractFilaService } from './abstract-fila.service';

@Injectable({
    providedIn: 'root'
})
export class MockedFilaService extends AbstractFilaService {
    fila = signal([
        { paciente: 'Maria Eduarda Costa', prioridade: 'Alta', tempoEspera: '15 min', especialidade: 'Pediatria', status: 'Aguardando' },
        { paciente: 'João Pedro Santos', prioridade: 'Normal', tempoEspera: '25 min', especialidade: 'Clínico Geral', status: 'Aguardando' },
        { paciente: 'Ana Paula Oliveira', prioridade: 'Normal', tempoEspera: '--', especialidade: 'Cardiologia', status: 'Em Atendimento' },
        { paciente: 'Lucas Ferreira', prioridade: 'Baixa', tempoEspera: '45 min', especialidade: 'Dermatologia', status: 'Aguardando' }
    ]);
}
