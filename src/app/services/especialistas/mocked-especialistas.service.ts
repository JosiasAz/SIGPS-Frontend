import { Injectable, signal } from '@angular/core';
import { AbstractEspecialistasService } from './abstract-especialistas.service';

@Injectable({
    providedIn: 'root'
})
export class MockedEspecialistasService extends AbstractEspecialistasService {
    especialistas = signal([
        { nome: 'Dr. Anderson Silva', documento: 'CRM 12345/SP', especialidade: 'Cardiologia', status: 'online' },
        { nome: 'Dra. Roberta Santos', documento: 'CRM 23456/SP', especialidade: 'Pediatria', status: 'online' },
        { nome: 'Dr. Marcos Vale', documento: 'CRM 34567/SP', especialidade: 'Dermatologia', status: 'offline' },
        { nome: 'Dra. Aline Costa', documento: 'CRM 45678/SP', especialidade: 'Ginecologia', status: 'online' }
    ]);
}
