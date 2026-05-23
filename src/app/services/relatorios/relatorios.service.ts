import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractRelatoriosService } from './abstract-relatorios.service';
import { environment } from '../../env/environment';

@Injectable({
    providedIn: 'root'
})
export class RelatoriosService extends AbstractRelatoriosService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;
    kpis = signal<any[]>([]);

    constructor() {
        super();
        this.loadKPIs();
    }

    private loadKPIs() {
        this.http.get<any[]>(`${this.apiUrl}/relatorios/kpis`).subscribe(data => this.kpis.set(data));
    }
}
