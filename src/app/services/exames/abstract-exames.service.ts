import { Signal } from '@angular/core';
import { Exame } from '../../models/exame.model';
export type { Exame };

export abstract class AbstractExamesService {
  abstract exames: Signal<Exame[]>;
  abstract examesCount: Signal<number>;
  abstract excluirExame(id: number): void;
  abstract getExameById(id: number): Exame | undefined;
}
