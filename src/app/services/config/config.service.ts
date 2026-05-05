import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractConfigService } from './abstract-config.service';
import { environment } from '../../env/environment';

@Injectable({
    providedIn: 'root'
})
export class ConfigService extends AbstractConfigService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;
    settings = signal<any[]>([]);

    constructor() {
        super();
        this.loadSettings();
    }

    private loadSettings() {
        this.http.get<any[]>(`${this.apiUrl}/config/settings`).subscribe(data => this.settings.set(data));
    }

    toggleSetting(label: string): void {
        this.settings.update(s => s.map(setting => 
            setting.label === label ? { ...setting, value: !setting.value } : setting
        ));
    }
}
