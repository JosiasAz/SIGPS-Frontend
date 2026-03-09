import { Signal } from '@angular/core';

export abstract class AbstractConfigService {
    abstract settings: Signal<any[]>;
}
