Crie a estrutura inicial de um projeto Full Stack monorepo (ou em duas pastas separadas: `backend` e `frontend`) para um aplicativo de recomendação de livros via chat com Inteligência Artificial.

Tecnologias solicitadas:
- Backend: NestJS, TypeScript, WebSocket (Socket.io ou WebSockets) ou Server-Sent Events (SSE) / REST API para o chat, e integração com a API do Google Gemini (@google/genai ou @google/generative-ai).
- Frontend: Angular (v17+ com Standalone Components, Signals e Angular CLI).

---

### REQUISITOS DO BACKEND (NestJS):
1. Crie o projeto NestJS na pasta `backend/`.
2. Configure as variáveis de ambiente com `@nestjs/config` e suporte ao arquivo `.env` (contendo `GEMINI_API_KEY` e `PORT=3000`).
3. Crie um módulo `GeminiModule` e um serviço `GeminiService` responsável por:
   - Inicializar o cliente da API do Gemini.
   - Manter um fluxo de conversa com System Instructions definidos para agir como um bibliotecário/consultor literário.
   - Conduzir o usuário fazendo perguntas iniciais para coletar preferências (gêneros preferidos, autores, ritmo de leitura, temas do momento, tamanho do livro).
   - Identificar quando o perfil do usuário estiver suficiente e retornar uma recomendação filtrada de livros (formato JSON estruturado ou resposta formatada em Markdown).
4. Crie um módulo/gateway de chat (`ChatModule` e `ChatGateway` com WebSocket ou `ChatController` com REST/SSE) para intermediar o envio de mensagens entre o Frontend Angular e o `GeminiService`.
5. Crie um mock inicial de base de dados de livros (ou array de livros) para que o Gemini possa filtrar ou usar como referência de catálogo.
6. Configure o CORS no NestJS para permitir chamadas vindo do frontend Angular (`http://localhost:4200`).

---

### REQUISITOS DO FRONTEND (Angular):
1. Crie o projeto Angular na pasta `frontend/` com suporte a Standalone Components e SCSS.
2. Crie os seguintes componentes principais:
   - `ChatContainerComponent`: Componente pai da tela de chat.
   - `ChatMessageComponent`: Exibe mensagens individuais (diferenciando usuário vs assistente IA).
   - `ChatInputComponent`: Campo de texto e botão para enviar mensagens.
   - `BookRecommendationCardComponent`: Card para exibir o livro recomendado (título, autor, sinopse, tag de gênero).
3. Crie um serviço `ChatService` em Angular para gerenciar a conexão com o backend (WebSocket/HTTP) e manter o estado das mensagens usando Angular Signals (`signal<Message[]>`).
4. Aplique um layout limpo e moderno (pode usar Tailwind CSS ou CSS/SCSS nativo flexbox) simulando uma interface de chat no estilo ChatGPT/Gemini.

---

### INSTRUÇÕES DE EXECUÇÃO:
1. Gere os arquivos e instalações necessárias para ambos os projetos.
2. Crie arquivos `.env.example` para documentar as variáveis de ambiente necessárias.
3. Garanta que o código esteja em TypeScript limpo, tipado e com tratamento básico de erros.