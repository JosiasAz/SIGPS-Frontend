import { Signal } from '@angular/core';

export abstract class AbstractFilaService {
    abstract fila: Signal<any[]>;
}
