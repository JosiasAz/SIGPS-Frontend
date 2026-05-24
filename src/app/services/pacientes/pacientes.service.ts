import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AbstractPacientesService, Paciente } from './abstract-pacientes.service';
import { environment } from '../../env/environment';

@Injectable({
    providedIn: 'root'
})
export class PacientesService extends AbstractPacientesService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    pacientes = signal<Paciente[]>([]);

    constructor() {
        super();
        this.loadPacientes();
    }

    private loadPacientes() {
        // Usando o prefixo /api/v1 do backend real
        this.http.get<Paciente[]>(`${this.apiUrl}/api/v1/patients/`).subscribe({
            next: (data) => this.pacientes.set(data),
            error: (err) => console.error('Erro ao buscar pacientes:', err)
        });
    }

    adicionarPaciente(paciente: Omit<Paciente, 'id'>): void {
        this.http.post<Paciente>(`${this.apiUrl}/api/v1/patients/`, paciente).subscribe({
            next: (novoPaciente) => {
                this.pacientes.update(pacientes => [...pacientes, novoPaciente]);
            },
            error: (err) => console.error('Erro ao adicionar paciente:', err)
        });
    }

    atualizarPaciente(id: number, paciente: Partial<Paciente>): void {
        this.http.put<Paciente>(`${this.apiUrl}/api/v1/patients/${id}`, paciente).subscribe({
            next: (pacienteAtualizado) => {
                this.pacientes.update(pacientes => 
                    pacientes.map(p => p.id === id ? pacienteAtualizado : p)
                );
            },
            error: (err) => console.error('Erro ao atualizar paciente:', err)
        });
    }

    excluirPaciente(id: number): void {
        this.http.delete(`${this.apiUrl}/api/v1/patients/${id}`).subscribe({
            next: () => {
                this.pacientes.update(pacientes => pacientes.filter(p => p.id !== id));
            },
            error: (err) => console.error('Erro ao excluir paciente:', err)
        });
    }
}
