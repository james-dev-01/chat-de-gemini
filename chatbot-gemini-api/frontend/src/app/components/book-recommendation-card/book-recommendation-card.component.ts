import { Component, input } from '@angular/core';
import { Book } from '../../models/chat.models';

@Component({
  selector: 'app-book-recommendation-card',
  standalone: true,
  template: `
    <article class="book-card">
      <div class="cover" aria-hidden="true"><span class="cover-mark">✳</span><span class="cover-title">{{ book().title }}</span><span class="cover-author">{{ book().author }}</span></div>
      <div class="details">
        <span class="eyebrow">UMA SUGESTÃO PARA VOCÊ</span>
        <h3>{{ book().title }}</h3><p class="author">{{ book().author }}</p>
        <p class="synopsis">{{ book().synopsis }}</p>
        <div class="meta"><span class="genre">{{ book().genres[0] }}</span><span>{{ book().pages }} páginas</span></div>
      </div>
    </article>
  `,
  styles: [`
    :host { display: block; min-width: 0; }
    .book-card { height: 100%; min-height: 170px; display: flex; gap: 15px; padding: 15px; border: 1px solid #ece7de; border-radius: 16px; background: #fffdfa; box-shadow: 0 4px 16px #43371708; }
    .cover { width: 88px; min-height: 140px; flex: 0 0 88px; display: flex; flex-direction: column; justify-content: space-between; padding: 12px 10px; border-radius: 5px 10px 10px 5px; background: linear-gradient(145deg,#73806b,#485543); color: #faf7ef; box-shadow: 3px 4px 8px #26281720, inset 3px 0 0 #ffffff1c; }
    :host:nth-child(2n) .cover { background: linear-gradient(145deg,#bd9970,#896c4e); }
    .cover-mark { font-size: 17px; opacity: .8; }
    .cover-title { font: 600 12px/1.3 Georgia,serif; }
    .cover-author { font: 9px/1.3 inherit; opacity: .8; }
    .details { min-width: 0; display: flex; flex-direction: column; align-items: flex-start; }
    .eyebrow { color: #8a927d; font-size: 8px; font-weight: 750; letter-spacing: .1em; }
    h3 { margin: 8px 0 2px; color: #39372f; font: 600 15px/1.25 Georgia,serif; }
    .author { margin: 0; color: #847a69; font-size: 11px; }
    .synopsis { display: -webkit-box; overflow: hidden; margin: 9px 0 10px; color: #70695e; font-size: 11px; line-height: 1.5; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
    .meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: auto; color: #948b7e; font-size: 9px; }
    .genre { padding: 4px 8px; border-radius: 99px; background: #edf0e9; color: #64715c; font-size: 9px; }
    @media (max-width: 420px) { .book-card { gap: 11px; padding: 12px; } .cover { width: 75px; flex-basis: 75px; } }
  `],
})
export class BookRecommendationCardComponent {
  readonly book = input.required<Book>();
}
