import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractEspecialistasService, Profissional } from './abstract-especialistas.service';
import { environment } from '../../env/environment';

@Injectable({
    providedIn: 'root'
})
export class EspecialistasService extends AbstractEspecialistasService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;
    especialistas = signal<Profissional[]>([]);

    constructor() {
        super();
        this.loadEspecialistas();
    }

    private loadEspecialistas() {
        this.http.get<Profissional[]>(`${this.apiUrl}/api/v1/specialists/`).subscribe({
            next: (data) => this.especialistas.set(data),
            error: (err) => console.error('Erro ao buscar especialistas:', err)
        });
    }

    getProfissionalById(id: number): Profissional | undefined {
        return this.especialistas().find(p => p.id === id);
    }
}
