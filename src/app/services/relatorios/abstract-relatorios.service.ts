import { Signal } from '@angular/core';

export abstract class AbstractRelatoriosService {
    abstract kpis: Signal<any[]>;
}
