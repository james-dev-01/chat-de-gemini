import { Component, ElementRef, afterNextRender, inject, viewChild } from '@angular/core';
import { BookOpen, Feather, Leaf, LucideAngularModule, RotateCcw, Sparkles } from 'lucide-angular';
import { ChatService } from '../../services/chat.service';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { ChatMessageComponent } from '../chat-message/chat-message.component';

@Component({
  selector: 'app-chat-container',
  standalone: true,
  imports: [ChatInputComponent, ChatMessageComponent, LucideAngularModule],
  template: `
    <div class="app-shell">
      <header class="topbar">
        <a class="brand" href="#" aria-label="Lume, início"><span class="brand-icon"><lucide-icon [img]="BookOpen" [size]="19" /></span><span>Lume<span class="brand-dot">.</span></span></a>
        <div class="topbar-center"><span class="status-dot" [class.status-dot--offline]="chat.connectionStatus() === 'disconnected'"></span>{{ chat.connectionStatus() === 'connected' ? 'Seu cantinho literário' : 'Reconectando...' }}</div>
        <button class="reset-button" type="button" (click)="resetChat()" aria-label="Reiniciar conversa" title="Nova conversa"><lucide-icon [img]="RotateCcw" [size]="16" /><span>Nova conversa</span></button>
      </header>

      <main class="main-content">
        <section class="chat-area" aria-label="Conversa com a Luma">
          <div class="conversation" #conversation>
            @if (chat.messages().length === 1) {
              <div class="welcome">
                <div class="welcome-flower"><lucide-icon [img]="Sparkles" [size]="22" /></div>
                <span class="overline">UM ENCONTRO COM NOVAS HISTÓRIAS</span>
                <h1>Todo grande livro<br />começa com <em>uma conversa.</em></h1>
                <p>Me conte um pouco sobre você. Juntos, vamos encontrar uma história que chegue na hora certa.</p>
                <div class="prompt-chips"><span><lucide-icon [img]="Feather" [size]="14" /> Descobrir algo novo</span><span><lucide-icon [img]="Leaf" [size]="14" /> Encontrar meu próximo livro</span></div>
              </div>
            }
            @for (message of chat.messages(); track message.id) { <app-chat-message [message]="message" /> }
            @if (chat.isLoading()) {
              <div class="typing"><div class="typing-avatar">l</div><div class="typing-content"><span class="typing-name">Luma</span><span class="typing-bubble"><i></i><i></i><i></i></span></div></div>
            }
          </div>
          <footer class="composer-area">
            <app-chat-input [disabled]="chat.isLoading()" (send)="sendMessage($event)" />
            <p>Feito com carinho para quem ama boas histórias <span>✳</span></p>
          </footer>
        </section>
        <aside class="sidebar">
          <div class="sidebar-heading"><span class="sidebar-icon"><lucide-icon [img]="BookOpen" [size]="17" /></span><span>O ritual da leitura</span></div>
          <p class="sidebar-intro">Um bom livro não se escolhe. Ele encontra você.</p>
          <div class="divider"></div>
          <div class="note"><span class="note-number">01</span><div><strong>Sem pressa</strong><p>Encontramos a leitura no seu ritmo, do seu jeito.</p></div></div>
          <div class="note"><span class="note-number">02</span><div><strong>Feito para você</strong><p>Cada sugestão nasce do que faz seus olhos brilharem.</p></div></div>
          <div class="note"><span class="note-number">03</span><div><strong>Novos caminhos</strong><p>Às vezes, uma boa conversa revela uma surpresa.</p></div></div>
          <div class="sidebar-footer"><div class="tiny-mark">✳</div><span>um capítulo de cada vez</span></div>
        </aside>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100dvh; }
    .app-shell { min-height: 100dvh; display: flex; flex-direction: column; background: #faf9f6; }
    .topbar { height: 68px; flex: 0 0 68px; display: grid; grid-template-columns: 1fr 1fr 1fr; align-items: center; padding: 0 5.5%; border-bottom: 1px solid #eeece6; background: #fcfbf8; }
    .brand { display: inline-flex; align-items: center; gap: 10px; width: fit-content; color: #42483c; text-decoration: none; font: 600 21px Georgia,serif; letter-spacing: -.05em; }
    .brand-icon { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 11px; background: #e9ede5; color: #5e7157; }
    .brand-dot { color: #99a489; }
    .topbar-center { display: flex; justify-content: center; align-items: center; gap: 8px; color: #938c80; font-size: 11px; }
    .status-dot { width: 7px; height: 7px; border-radius: 50%; background: #83a177; box-shadow: 0 0 0 3px #83a17719; }
    .status-dot--offline { background: #c6a66a; box-shadow: 0 0 0 3px #c6a66a19; }
    .reset-button { justify-self: end; display: inline-flex; align-items: center; gap: 7px; padding: 8px 11px; border: 1px solid #e9e6df; border-radius: 9px; background: transparent; color: #777165; font-size: 11px; cursor: pointer; transition: background .2s; }
    .reset-button:hover { background: #f3f1ec; }
    .main-content { flex: 1; width: 100%; max-width: 1440px; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) 285px; margin: 0 auto; padding: 0 5.5%; }
    .chat-area { min-width: 0; min-height: calc(100dvh - 68px); display: flex; flex-direction: column; border-right: 1px solid #efede7; }
    .conversation { width: 100%; flex: 1; overflow-y: auto; padding: 38px clamp(16px,5vw,72px) 24px; scroll-behavior: smooth; }
    .welcome { max-width: 600px; margin: 5vh auto 62px; text-align: center; animation: rise .55s ease both; }
    .welcome-flower { width: 46px; height: 46px; display: grid; place-items: center; margin: 0 auto 20px; border: 1px solid #e6e9e0; border-radius: 16px; background: #f0f2ed; color: #75866c; }
    .overline { color: #9a9688; font-size: 9px; font-weight: 700; letter-spacing: .16em; }
    h1 { margin: 18px 0 13px; color: #48473f; font: 400 clamp(30px,4vw,43px)/1.16 Georgia,serif; letter-spacing: -.035em; }
    h1 em { color: #7f8b72; font-weight: 400; }
    .welcome > p { max-width: 390px; margin: 0 auto; color: #918a7f; font-size: 13px; line-height: 1.75; }
    .prompt-chips { display: flex; justify-content: center; flex-wrap: wrap; gap: 9px; margin-top: 26px; }
    .prompt-chips span { display: flex; align-items: center; gap: 7px; padding: 9px 12px; border: 1px solid #ebe8e1; border-radius: 99px; background: #fffefa; color: #837c70; font-size: 10px; }
    .prompt-chips lucide-icon { color: #89917f; }
    .composer-area { position: sticky; bottom: 0; z-index: 1; padding: 15px clamp(16px,5vw,72px) 21px; background: linear-gradient(0deg,#faf9f6 78%,#faf9f600); }
    .composer-area > p { margin: 10px 0 0; color: #aaa398; text-align: center; font-size: 9px; letter-spacing: .02em; }
    .composer-area > p span { color: #9ca68e; }
    .sidebar { position: sticky; top: 0; height: calc(100dvh - 68px); display: flex; flex-direction: column; padding: 50px 0 25px 30px; }
    .sidebar-heading { display: flex; align-items: center; gap: 10px; color: #59574e; font: 600 13px Georgia,serif; }
    .sidebar-icon { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 10px; background: #eeefe9; color: #78846d; }
    .sidebar-intro { max-width: 190px; margin: 19px 0 22px; color: #8d867a; font: italic 15px/1.6 Georgia,serif; }
    .divider { height: 1px; margin-bottom: 23px; background: #eeece6; }
    .note { display: flex; gap: 12px; margin-bottom: 21px; }
    .note-number { padding-top: 2px; color: #a6ad99; font: 12px Georgia,serif; }
    .note strong { color: #615e54; font: 600 11px Georgia,serif; }
    .note p { margin: 5px 0 0; color: #979084; font-size: 10px; line-height: 1.6; }
    .sidebar-footer { display: flex; align-items: center; gap: 7px; margin-top: auto; color: #aaa397; font: italic 10px Georgia,serif; }
    .tiny-mark { color: #9ca68e; font-size: 17px; }
    .typing { max-width: 780px; display: flex; gap: 14px; margin: 0 auto 28px; animation: rise .25s ease both; }
    .typing-avatar { width: 34px; height: 34px; flex: 0 0 34px; display: grid; place-items: center; border-radius: 12px; background: #e8ede5; color: #566b50; font: 22px Georgia,serif; }
    .typing-content { display: flex; flex-direction: column; gap: 9px; }
    .typing-name { color: #655a4b; font-size: 12px; font-weight: 650; }
    .typing-bubble { display: flex; gap: 4px; padding: 10px 12px; border: 1px solid #eeece5; border-radius: 12px; background: #fffefa; }
    .typing-bubble i { width: 5px; height: 5px; border-radius: 50%; background: #9ca68e; animation: blink 1s infinite ease-in-out; }
    .typing-bubble i:nth-child(2) { animation-delay: .15s; }.typing-bubble i:nth-child(3) { animation-delay: .3s; }
    @keyframes rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes blink { 0%,60%,100% { opacity: .4; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }
    @media (max-width: 850px) { .main-content { grid-template-columns: minmax(0,1fr); padding: 0 4%; }.chat-area { border-right: 0; }.sidebar { display: none; }.topbar { padding: 0 4%; } }
    @media (max-width: 480px) { .topbar { height: 60px; flex-basis: 60px; grid-template-columns: 1fr auto; }.topbar-center { display: none; }.reset-button span { display: none; }.reset-button { width: 34px; height: 34px; justify-content: center; padding: 0; }.chat-area { min-height: calc(100dvh - 60px); }.conversation { padding: 28px 10px 18px; }.welcome { margin: 4vh auto 45px; }.welcome > p { font-size: 12px; }.composer-area { padding: 12px 4px 16px; }.prompt-chips span { font-size: 9px; } }
  `],
})
export class ChatContainerComponent {
  readonly chat = inject(ChatService);
  readonly conversation = viewChild<ElementRef<HTMLDivElement>>('conversation');
  readonly BookOpen = BookOpen;
  readonly Feather = Feather;
  readonly Leaf = Leaf;
  readonly RotateCcw = RotateCcw;
  readonly Sparkles = Sparkles;

  constructor() {
    afterNextRender(() => {
      const element = this.conversation()?.nativeElement;
      if (element) new MutationObserver(() => (element.scrollTop = element.scrollHeight)).observe(element, { childList: true, subtree: true });
    });
  }

  sendMessage(message: string): void { this.chat.sendMessage(message); }
  resetChat(): void { this.chat.resetConversation(); }
}
