import { Injectable, computed, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { Book, ChatMessage, ChatReply } from '../models/chat.models';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly socket: Socket;
  private readonly messageHandler = (reply: ChatReply): void => this.handleReply(reply);
  private readonly errorHandler = (error: { message?: string }): void =>
    this.handleError(error.message ?? 'Ocorreu um erro ao enviar sua mensagem.');

  readonly messages = signal<ChatMessage[]>([
    {
      id: this.createId(),
      role: 'assistant',
      content: 'Oi! Eu sou a Luma, sua consultora literária. ✨\n\nQuero encontrar uma leitura que tenha a sua cara. Para começar: quais gêneros ou autores você costuma gostar?',
    },
  ]);
  readonly isLoading = signal(false);
  readonly connectionStatus = signal<'connected' | 'disconnected' | 'connecting'>('connecting');
  readonly messageCount = computed(() => this.messages().length);

  constructor() {
    this.socket = io(environment.socketUrl, { transports: ['websocket', 'polling'], reconnection: true });
    this.socket.on('connect', () => this.connectionStatus.set('connected'));
    this.socket.on('disconnect', () => this.connectionStatus.set('disconnected'));
    this.socket.on('connect_error', () => this.connectionStatus.set('disconnected'));
    this.socket.on('chat:reply', this.messageHandler);
    this.socket.on('chat:error', this.errorHandler);
  }

  sendMessage(content: string): void {
    const text = content.trim();
    if (!text || this.isLoading()) return;

    const userMessage: ChatMessage = { id: this.createId(), role: 'user', content: text };
    const updatedMessages = [...this.messages(), userMessage];
    this.messages.set(updatedMessages);
    this.isLoading.set(true);

    const history = updatedMessages.map(({ role, content: messageContent }) => ({ role, content: messageContent }));
    this.socket.emit('chat:message', { history });
  }

  resetConversation(): void {
    this.messages.set([
      {
        id: this.createId(),
        role: 'assistant',
        content: 'Conversa reiniciada! 📚\n\nQuais gêneros ou autores você costuma gostar?',
      },
    ]);
    this.isLoading.set(false);
  }

  private handleReply(reply: ChatReply): void {
    const message: ChatMessage = {
      id: this.createId(),
      role: 'assistant',
      content: reply.text,
      recommendations: reply.recommendations,
    };
    this.messages.update((messages) => [...messages, message]);
    this.isLoading.set(false);
  }

  private handleError(message: string): void {
    this.messages.update((messages) => [...messages, { id: this.createId(), role: 'assistant', content: message }]);
    this.isLoading.set(false);
  }

  private createId(): string {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

}
