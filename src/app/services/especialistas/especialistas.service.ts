import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractEspecialistasService } from './abstract-especialistas.service';
import { environment } from '../../env/environment';

@Injectable({
    providedIn: 'root'
})
export class EspecialistasService extends AbstractEspecialistasService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;
    especialistas = signal<any[]>([]);

    constructor() {
        super();
        this.loadEspecialistas();
    }

    private loadEspecialistas() {
        this.http.get<any[]>(`${this.apiUrl}/api/v1/specialists/`).subscribe({
            next: (data) => this.especialistas.set(data),
            error: (err) => console.error('Erro ao buscar especialistas:', err)
        });
    }
}
