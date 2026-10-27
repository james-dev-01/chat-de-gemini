import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatMessage } from '../book.types';
import { GeminiService } from '../gemini/gemini.service';

interface SendChatPayload {
  history: ChatMessage[];
}

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:4200', credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly gemini: GeminiService) {}

  handleConnection(client: Socket): void {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('chat:message')
  async handleMessage(
    @MessageBody() payload: SendChatPayload,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    if (!Array.isArray(payload?.history) || payload.history.length === 0) {
      client.emit('chat:error', { message: 'Envie uma mensagem para iniciar a conversa.' });
      return;
    }

    try {
      const safeHistory = payload.history
        .filter((message) => message && (message.role === 'user' || message.role === 'assistant'))
        .slice(-30)
        .map((message) => ({
          role: message.role,
          content: String(message.content ?? '').slice(0, 4000),
        }));
      client.emit('chat:reply', await this.gemini.reply(safeHistory));
    } catch {
      client.emit('chat:error', { message: 'Não foi possível responder agora. Tente novamente em instantes.' });
    }
  }
}
