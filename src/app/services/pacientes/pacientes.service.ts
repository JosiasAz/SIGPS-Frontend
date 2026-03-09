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
}
