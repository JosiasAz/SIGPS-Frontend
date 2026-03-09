import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractFilaService } from './abstract-fila.service';
import { environment } from '../../env/environment';

@Injectable({
    providedIn: 'root'
})
export class FilaService extends AbstractFilaService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;
    fila = signal<any[]>([]);

    constructor() {
        super();
        this.loadFila();
    }

    private loadFila() {
        this.http.get<any[]>(`${this.apiUrl}/fila`).subscribe(data => this.fila.set(data));
    }
}
