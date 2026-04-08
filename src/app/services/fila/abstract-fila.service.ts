import { Signal } from '@angular/core';

export abstract class AbstractFilaService {
    abstract fila: Signal<any[]>;
    abstract reordenarFila(): void;
    abstract analisarIA(): void;
    abstract atenderPaciente(pacienteNome: string): void;
}
