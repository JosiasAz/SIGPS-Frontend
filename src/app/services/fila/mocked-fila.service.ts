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

    reordenarFila(): void {
        const priorityScore: Record<string, number> = { 'Extrema': 4, 'Alta': 3, 'Normal': 2, 'Baixa': 1 };
        const novaFila = [...this.fila()].sort((a, b) => {
            if (a.status === 'Em Atendimento' && b.status !== 'Em Atendimento') return -1;
            if (b.status === 'Em Atendimento' && a.status !== 'Em Atendimento') return 1;
            return (priorityScore[b.prioridade] || 0) - (priorityScore[a.prioridade] || 0);
        });
        this.fila.set(novaFila);
    }

    analisarIA(): void {
        const currentFila = [...this.fila()];
        // Criação de um caso extremo classificado pela IA do SIGPS
        currentFila.unshift({ 
            paciente: 'Roberto Silva (Anomalia Cardíaca identificada por IA)', 
            prioridade: 'Extrema', 
            tempoEspera: '0 min', 
            especialidade: 'Cardiologia', 
            status: 'Aguardando' 
        });
        this.fila.set(currentFila);
    }

    atenderPaciente(pacienteNome: string): void {
        const currentFila = this.fila().map(p => {
            if (p.paciente === pacienteNome) {
                return { ...p, status: 'Em Atendimento', tempoEspera: '--' };
            }
            return p;
        });
        this.fila.set(currentFila);
    }
}
