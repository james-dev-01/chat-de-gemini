import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";
import { BOOK_CATALOG } from "../catalog";
import { Book, ChatMessage, ChatReply } from "../book.types";

const SYSTEM_INSTRUCTIONS = `Você é a Luma, uma bibliotecária e consultora literária brasileira, acolhedora e curiosa. Converse sempre em português. Primeiro, entenda as preferências do leitor com perguntas naturais sobre gêneros preferidos, autores, ritmo de leitura (leve, moderado ou intenso), temas do momento e tamanho do livro (curto, médio ou longo). Faça no máximo uma pergunta de cada vez e aproveite o que a pessoa já contou. Considere o perfil suficiente quando entender ao menos 3 dessas 5 dimensões; então ofereça uma recomendação adequada, explique brevemente por que combina e convide a pessoa a continuar a conversa. Recomende somente livros presentes no catálogo fornecido. Responda sempre com um único objeto JSON válido, sem cercas Markdown, no formato {"text":"sua resposta em português","recommendationIds":["id-do-livro"],"profileComplete":true}. Antes de perfil suficiente use recommendationIds vazio e profileComplete false. Quando recomendar, inclua de 1 a 3 IDs exatos do catálogo.`;

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly client?: GoogleGenAI;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>("GEMINI_API_KEY");
    if (apiKey) {
      this.client = new GoogleGenAI({ apiKey });
    } else {
      this.logger.warn(
        "GEMINI_API_KEY ausente: usando modo de demonstração local.",
      );
    }
  }

  async reply(history: ChatMessage[]): Promise<ChatReply> {
    if (!this.client) {
      return this.demoReply(history);
    }

    const prompt = [
      `CATÁLOGO DISPONÍVEL:\n${JSON.stringify(BOOK_CATALOG)}`,
      "HISTÓRICO DA CONVERSA:",
      ...history.map(
        (message) =>
          `${message.role === "user" ? "Leitor" : "Luma"}: ${message.content}`,
      ),
      "Responda seguindo as instruções e o formato JSON.",
    ].join("\n");

    try {
      const result = await this.client.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS,
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });
      const raw = result.text?.trim();
      if (!raw) throw new Error("O Gemini retornou uma resposta vazia.");
      console.log(raw);

      return this.parseReply(raw);
    } catch (error) {
      this.logger.error(
        "Falha ao consultar o Gemini.",
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private parseReply(raw: string): ChatReply {
    const parsed = JSON.parse(raw) as {
      text?: unknown;
      recommendationIds?: unknown;
      profileComplete?: unknown;
    };
    const ids = Array.isArray(parsed.recommendationIds)
      ? parsed.recommendationIds.filter(
          (id): id is string => typeof id === "string",
        )
      : [];
    const recommendations: Book[] = ids
      .map((id) => BOOK_CATALOG.find((book) => book.id === id))
      .filter((book): book is Book => book !== undefined)
      .slice(0, 3);

    return {
      text:
        typeof parsed.text === "string"
          ? parsed.text
          : "Vamos encontrar sua próxima leitura favorita!",
      recommendations,
      profileComplete: parsed.profileComplete === true,
    };
  }

  private demoReply(history: ChatMessage[]): ChatReply {
    const userTurns = history.filter((message) => message.role === "user");
    const turn = userTurns.length;
    if (turn < 3) {
      const questions = [
        "Quais gêneros ou autores você costuma gostar?",
        "Você prefere uma leitura leve, moderada ou mais intensa? E há algum tema no seu momento atual?",
        "E quanto ao tamanho: algo curtinho, médio ou um livro mais longo?",
      ];
      return {
        text: questions[Math.min(turn - 1, questions.length - 1)],
        recommendations: [],
        profileComplete: false,
      };
    }

    const lastAnswer =
      userTurns[userTurns.length - 1]?.content.toLocaleLowerCase("pt-BR") ?? "";
    let picks = BOOK_CATALOG.filter((book) =>
      [...book.genres, ...book.themes, book.author, book.title].some((term) =>
        lastAnswer.includes(term.toLocaleLowerCase("pt-BR")),
      ),
    );
    if (!picks.length) picks = [BOOK_CATALOG[(turn - 1) % BOOK_CATALOG.length]];
    return {
      text: `Já tenho uma boa ideia do seu perfil! Minha sugestão é **${picks[0].title}**, de ${picks[0].author}. ${picks[0].synopsis} Quer que eu explore outras opções do catálogo?`,
      recommendations: picks.slice(0, 2),
      profileComplete: true,
    };
  }
}
