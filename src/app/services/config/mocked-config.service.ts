import { Injectable, signal } from '@angular/core';
import { AbstractConfigService } from './abstract-config.service';

@Injectable({
    providedIn: 'root'
})
export class MockedConfigService extends AbstractConfigService {
    settings = signal([
        { label: 'Notificações por E-mail', description: 'Receber alertas de novos agendamentos', value: true },
        { label: 'Priorização por IA', description: 'Ativar algoritmo de reordenação automática', value: true },
        { label: 'Modo Escuro Permanente', description: 'Forçar tema dark para todos os usuários', value: false },
        { label: 'Backup Automático', description: 'Realizar cópia de segurança a cada 24h', value: true }
    ]);

    toggleSetting(label: string): void {
        this.settings.update(s => s.map(setting => 
            setting.label === label ? { ...setting, value: !setting.value } : setting
        ));
    }
}
