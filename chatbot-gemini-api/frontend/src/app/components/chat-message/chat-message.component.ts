import { Component, input } from '@angular/core';
import { Book, ChatMessage } from '../../models/chat.models';
import { BookRecommendationCardComponent } from '../book-recommendation-card/book-recommendation-card.component';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [BookRecommendationCardComponent],
  template: `
    <article class="message" [class.message--user]="message().role === 'user'" [class.message--assistant]="message().role === 'assistant'">
      @if (message().role === 'assistant') {
        <div class="avatar" aria-label="Luma, assistente"><span>l</span></div>
      }
      <div class="message-body">
        @if (message().role === 'assistant') { <span class="sender">Luma</span> }
        <div class="bubble" [class.bubble--user]="message().role === 'user'">{{ message().content }}</div>
        @if (message().recommendations?.length) {
          <div class="recommendations" aria-label="Livros recomendados">
            @for (book of message().recommendations; track book.id) { <app-book-recommendation-card [book]="book" /> }
          </div>
        }
      </div>
      @if (message().role === 'user') { <div class="user-avatar" aria-label="Você">v</div> }
    </article>
  `,
  styles: [`
    :host { display: block; }
    .message { display: flex; align-items: flex-start; gap: 14px; max-width: 780px; margin: 0 auto 30px; animation: rise .35s ease both; }
    .message--user { justify-content: flex-end; }
    .message-body { max-width: min(78%, 650px); min-width: 0; }
    .sender { display: block; margin: 2px 0 8px 3px; color: #655a4b; font-size: 12px; font-weight: 650; }
    .bubble { white-space: pre-line; line-height: 1.7; color: #403c35; font-size: 14px; }
    .bubble--user { padding: 13px 17px; border-radius: 18px 18px 5px 18px; background: #ece8e0; }
    .avatar, .user-avatar { width: 34px; height: 34px; flex: 0 0 34px; display: grid; place-items: center; border-radius: 12px; background: #e8ede5; color: #566b50; font-family: Georgia, serif; font-size: 22px; }
    .avatar span { transform: translateY(-1px); }
    .user-avatar { border-radius: 50%; background: #eee5d7; color: #806342; font-family: inherit; font-size: 14px; font-weight: 650; }
    .recommendations { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 15px; }
    @keyframes rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 560px) { .message { gap: 9px; margin-bottom: 24px; } .message-body { max-width: 84%; } .recommendations { grid-template-columns: 1fr; } }
  `],
})
export class ChatMessageComponent {
  readonly message = input.required<ChatMessage>();
}
