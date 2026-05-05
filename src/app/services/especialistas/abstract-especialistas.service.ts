import { Signal } from '@angular/core';
import { Profissional } from '../../models/profissional.model';
export type { Profissional };

export abstract class AbstractEspecialistasService {
    abstract especialistas: Signal<Profissional[]>;
    abstract getProfissionalById(id: number): Profissional | undefined;
    abstract addEspecialista(especialista: Partial<Profissional>): void;
    abstract updateEspecialista(id: number, especialista: Partial<Profissional>): void;
    abstract removeEspecialista(id: number): void;
}
