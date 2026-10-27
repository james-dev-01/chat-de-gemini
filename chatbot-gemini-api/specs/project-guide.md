# Lume — Guia do projeto

Este documento descreve a arquitetura, o fluxo de conversa e as instruções para instalar, executar, testar e estender o Lume, um aplicativo Full Stack que ajuda leitores a descobrir livros por meio de uma conversa com uma consultora literária baseada em IA.

## 1. Visão geral

O projeto é organizado como um monorepo simples, com dois aplicativos independentes:

- `backend/`: API NestJS em TypeScript, endpoints REST, gateway Socket.IO e integração opcional com Google Gemini.
- `frontend/`: aplicação Angular 19 com componentes standalone, Signals, SCSS e cliente Socket.IO.
- `specs/`: especificações e documentação do projeto.

O backend consulta apenas os livros presentes em seu catálogo local. Assim, as recomendações ficam limitadas às obras disponíveis, mesmo quando o Gemini está habilitado.

## 2. Tecnologias

### Backend

- Node.js 20 ou superior e npm.
- NestJS 11, TypeScript e `@nestjs/config`.
- Socket.IO por meio do gateway NestJS.
- REST com endpoints para saúde, catálogo e conversa.
- SDK `@google/genai`, usando o modelo `gemini-2.5-flash`.
- `class-validator` e `class-transformer` para validar DTOs.
- Jest e `ts-jest` para testes unitários.

### Frontend

- Angular 19 e Angular CLI.
- Componentes standalone e Signals para estado reativo.
- SCSS para estilos responsivos.
- `socket.io-client` para comunicação em tempo real.
- `lucide-angular` para ícones.

## 3. Pré-requisitos

1. Instale Node.js 20+ e npm.
2. Para recomendações com IA, obtenha uma chave de API do Google Gemini.
3. No Windows, se a política do PowerShell bloquear `npm.ps1`, execute `npm.cmd` nos comandos abaixo.

## 4. Configuração inicial

### Backend

No terminal, a partir da raiz do projeto:

```powershell
Copy-Item backend/.env.example backend/.env
```

Edite `backend/.env` e informe a chave real:

```dotenv
GEMINI_API_KEY=sua_chave_do_gemini
PORT=3000
FRONTEND_ORIGIN=http://localhost:4200
```

Não versione o arquivo `.env` nem compartilhe a chave. O arquivo `backend/.env.example` serve apenas de modelo.

Sem uma chave configurada, o backend inicia em modo de demonstração local. Nesse modo, as primeiras mensagens coletam preferências e, após algumas respostas, o serviço apresenta sugestões do catálogo sem chamar o Gemini.

### Frontend

O endereço do Socket.IO está definido em `frontend/src/environments/environment.ts`:

- `socketUrl`: URL do gateway NestJS, por padrão `http://localhost:3000`.
- `apiUrl`: endereço base da API REST, por padrão `http://localhost:3000`.

Ajuste esses valores se o backend estiver em outro host ou porta. O arquivo `frontend/.env.example` documenta os endereços locais; variáveis de ambiente do frontend Angular não são carregadas automaticamente pelo navegador.

## 5. Instalação e execução

Instale as dependências de cada aplicação uma vez:

```powershell
npm.cmd install --prefix backend
npm.cmd install --prefix frontend
```

Abra dois terminais na raiz do projeto e inicie os serviços.

Terminal 1 — backend:

```powershell
cd backend
npm.cmd run start:dev
```

Terminal 2 — frontend:

```powershell
cd frontend
npm.cmd start
```

Abra <http://localhost:4200>. A API ficará disponível em <http://localhost:3000>.

Para iniciar o backend a partir da versão compilada, primeiro gere os arquivos de saída:

```powershell
cd backend
npm.cmd run build
npm.cmd run start:prod
```

O comando de produção executa `node dist/main.js`; por isso, a compilação é necessária antes da primeira execução ou após limpar a pasta `dist`.

## 6. Como funciona a conversa

1. `ChatContainerComponent` apresenta a interface, as mensagens e o estado da conexão.
2. `ChatInputComponent` emite o texto enviado pelo leitor (Enter envia; Shift+Enter insere uma nova linha).
3. `ChatService` acrescenta a mensagem ao `signal<ChatMessage[]>`, prepara o histórico e emite o evento Socket.IO `chat:message`.
4. `ChatGateway` valida o formato básico, limita o histórico recebido e pede uma resposta ao `GeminiService`.
5. `GeminiService` instrui o modelo a atuar em português como bibliotecária, coletar gêneros, autores, ritmo, temas e tamanho preferido, e recomendar apenas IDs existentes no catálogo.
6. O backend envia `chat:reply` com o texto, os livros recomendados e o indicador `profileComplete`. Se houver falha de processamento, envia `chat:error`.
7. `ChatService` atualiza os Signals; `ChatMessageComponent` apresenta a resposta e, quando aplicável, `BookRecommendationCardComponent` mostra cada livro.

O catálogo é carregado de `backend/src/acervo_oficina_de_ti.json` por `backend/src/catalog.ts`. Cada entrada inclui título, autor, sinopse, gêneros, temas, ritmo de leitura e número de páginas; subtítulo e código CDD também são disponibilizados quando presentes.

## 7. Contratos de comunicação

### Socket.IO

Conecte o cliente a `http://localhost:3000` e envie:

- Evento de entrada: `chat:message`
- Payload: `{ "history": [{ "role": "user" | "assistant", "content": "..." }] }`
- Evento de sucesso: `chat:reply`
- Payload de sucesso: `{ "text": "...", "recommendations": [Book], "profileComplete": boolean }`
- Evento de erro: `chat:error`
- Payload de erro: `{ "message": "..." }`

O histórico é enviado pelo cliente a cada mensagem e não é persistido em banco de dados. O gateway usa até as 30 mensagens mais recentes.

### REST

- `GET /health`: retorna `{ "status": "ok" }`.
- `GET /books`: retorna o catálogo de demonstração.
- `POST /chat`: recebe `{ "history": [...] }` e retorna o mesmo formato de resposta da conversa.

Exemplo de corpo para `POST /chat`:

```json
{
  "history": [
    { "role": "user", "content": "Gosto de fantasia e prefiro livros curtos." }
  ]
}
```

O CORS do NestJS permite, por padrão, a origem `http://localhost:4200`. O gateway Socket.IO também configura essa origem.

## 8. Componentes e arquivos importantes

### Backend

- `backend/src/main.ts`: inicialização, porta, CORS e validação global.
- `backend/src/app.module.ts`: configuração global do `ConfigModule` e módulos da aplicação.
- `backend/src/gemini/gemini.module.ts`: módulo de recomendação.
- `backend/src/gemini/gemini.service.ts`: cliente Gemini, instruções de sistema, validação das recomendações e modo demo.
- `backend/src/chat/chat.module.ts`: composição do módulo de chat.
- `backend/src/chat/chat.gateway.ts`: eventos Socket.IO.
- `backend/src/chat/chat.controller.ts`: endpoints REST.
- `backend/src/chat/dto/send-message.dto.ts`: DTO validado para conversa REST.
- `backend/src/catalog.ts`: carregador tipado do acervo JSON local.
- `backend/src/acervo_oficina_de_ti.json`: fonte de dados local do catálogo.
- `backend/src/book.types.ts`: tipos compartilhados do backend.

### Frontend

- `frontend/src/main.ts`: bootstrap Angular.
- `frontend/src/app/app.component.ts`: componente raiz.
- `frontend/src/app/components/chat-container/`: layout e composição do chat.
- `frontend/src/app/components/chat-message/`: apresentação de mensagens.
- `frontend/src/app/components/chat-input/`: entrada e envio de mensagens.
- `frontend/src/app/components/book-recommendation-card/`: apresentação das recomendações.
- `frontend/src/app/services/chat.service.ts`: conexão Socket.IO e Signals.
- `frontend/src/app/models/chat.models.ts`: tipos usados pela interface.
- `frontend/src/environments/environment.ts`: endereços do backend.
- `frontend/src/styles.scss`: estilos globais.

## 9. Testes e builds

Backend:

```powershell
cd backend
npm.cmd test -- --runInBand
npm.cmd run build
```

Frontend:

```powershell
cd frontend
npm.cmd test -- --watch=false
npm.cmd run build
```

O frontend pode iniciar sua sessão de testes interativa conforme a configuração do Angular CLI. Use `--watch=false` para uma execução única em CI.

## 10. Tratamento de erros e limitações atuais

- Erros do Gemini são registrados no backend e convertidos em uma mensagem amigável para o cliente Socket.IO.
- O modo de demonstração permite experimentar a interface sem chave da API.
- Não há banco de dados, autenticação, histórico persistente, streaming de tokens nem gestão de sessões de usuário. As mensagens existem apenas no estado do navegador durante a sessão.
- O catálogo é estático e deve ser atualizado em `backend/src/acervo_oficina_de_ti.json`; não há banco de dados nem edição pelo aplicativo.
- O arquivo `.env` é carregado pelo `ConfigModule`; a chave Gemini não deve ser enviada ao frontend.

## 11. Próximos passos sugeridos

- Persistir conversas e perfis de leitura em um banco de dados.
- Adicionar testes de integração para o gateway e testes de componentes no Angular.
- Implementar controle de sessões, limites de uso e observabilidade.
- Ampliar e administrar o catálogo por uma fonte de dados persistente.
- Configurar URLs e segredos específicos para ambientes de homologação e produção.
