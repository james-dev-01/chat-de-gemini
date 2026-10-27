import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { GeminiService } from '../gemini/gemini.service';
import { BOOK_CATALOG } from '../catalog';

describe('ChatController', () => {
  let controller: ChatController;
  const gemini = { reply: jest.fn() };

  beforeEach(async () => {
    gemini.reply.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [{ provide: GeminiService, useValue: gemini }],
    }).compile();
    controller = module.get(ChatController);
  });

  it('returns the full catalog loaded from the acervo JSON', () => {
    expect(controller.books()).toEqual(BOOK_CATALOG);
    expect(BOOK_CATALOG.length).toBeGreaterThan(8);
    expect(BOOK_CATALOG.find((book) => book.id === '9786528037766')).toMatchObject({
      title: 'Computação quântica',
      subtitle: 'visual e intuitiva.',
      cddCode: '004',
    });
  });

  it('forwards chat history to the recommendation service', async () => {
    const history = [{ role: 'user' as const, content: 'Gosto de fantasia' }];
    const reply = { text: 'Vamos conversar!', recommendations: [], profileComplete: false };
    gemini.reply.mockResolvedValue(reply);

    await expect(controller.sendMessage({ history })).resolves.toEqual(reply);
    expect(gemini.reply).toHaveBeenCalledWith(history);
  });
});
