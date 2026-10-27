import { Module } from '@nestjs/common';
import { GeminiModule } from '../gemini/gemini.module';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [GeminiModule],
  controllers: [ChatController],
  providers: [ChatGateway],
})
export class ChatModule {}
