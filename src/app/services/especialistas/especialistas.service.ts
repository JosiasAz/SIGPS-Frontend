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

    getProfissionalByIdFromApi(id: number) {
        return this.http.get<Profissional>(`${this.apiUrl}/api/v1/specialists/${id}`);
    }

    addEspecialista(especialista: Partial<Profissional>): void {
        // Criação de especialista é feita via auth/register com perfil Especialista.
        // Após o cadastro, o perfil pode ser atualizado via PATCH /specialists/me.
        console.warn('Use o fluxo de cadastro de usuário com perfil Especialista.');
    }

    updateEspecialista(id: number, especialista: Partial<Profissional>): void {
        this.http.patch(`${this.apiUrl}/api/v1/specialists/me`, especialista).subscribe({
            next: (res: any) => {
                this.especialistas.update(s => s.map(e => e.id === id ? { ...e, ...res.especialista } : e));
            },
            error: (err) => console.error('Erro ao atualizar especialista:', err)
        });
    }

    removeEspecialista(id: number): void {
        console.warn('Remoção de especialista deve ser feita via painel administrativo.');
    }
}
