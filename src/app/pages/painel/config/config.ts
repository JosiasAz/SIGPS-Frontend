import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractConfigService } from '../../../services/config/abstract-config.service';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './config.html',
  styleUrls: ['../painel.scss'],
})
export class ConfigComponent {
  private configService = inject(AbstractConfigService);
  settings = this.configService.settings();
}
