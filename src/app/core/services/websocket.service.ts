import { Injectable, signal } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket?: WebSocket;
  private messageSubject = new Subject<any>();
  
  public connectionStatus = signal<'connected' | 'disconnected' | 'connecting'>('disconnected');

  constructor() {}

  connect(url: string): void {
    if (typeof window === 'undefined') return;
    if (this.socket?.readyState === WebSocket.OPEN) return;

    this.connectionStatus.set('connecting');
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket Connected');
      this.connectionStatus.set('connected');
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.messageSubject.next(data);
      } catch (e) {
        this.messageSubject.next(event.data);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket Disconnected');
      this.connectionStatus.set('disconnected');
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
      this.connectionStatus.set('disconnected');
    };
  }

  sendMessage(message: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      const payload = typeof message === 'string' ? message : JSON.stringify(message);
      this.socket.send(payload);
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
