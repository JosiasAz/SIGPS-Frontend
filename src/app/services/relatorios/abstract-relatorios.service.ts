import { Signal } from '@angular/core';
import { RelatorioResumo } from '../../models/relatorio.model';

export abstract class AbstractRelatoriosService {
  abstract relatorio: Signal<RelatorioResumo | null>;
  abstract carregando: Signal<boolean>;
  abstract erro: Signal<string | null>;
  abstract loadResumo(periodo?: string): void;
}
