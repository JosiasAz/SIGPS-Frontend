import { Injectable, signal } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../env/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket?: WebSocket;
  private messageSubject = new Subject<any>();
  
  public connectionStatus = signal<'connected' | 'disconnected' | 'connecting'>('disconnected');

  constructor() {}

  connect(url: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    this.connectionStatus.set('connecting');
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket Connected');
      this.connectionStatus.set('connected');
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.messageSubject.next(data);
    };

    this.socket.onclose = () => {
      console.log('WebSocket Disconnected');
      this.connectionStatus.set('disconnected');
      // Optional: auto-reconnect logic here
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
      this.connectionStatus.set('disconnected');
    };
  }

  sendMessage(message: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not open. Message not sent:', message);
    }
  }

  getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  disconnect(): void {
    this.socket?.close();
  }
}
