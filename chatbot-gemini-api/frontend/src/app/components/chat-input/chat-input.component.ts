import { Component, ElementRef, input, output, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ArrowUp, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <form class="composer" (ngSubmit)="submit()">
      <label class="sr-only" for="message-input">Sua mensagem</label>
      <textarea #messageField id="message-input" name="message" [(ngModel)]="draft" (keydown)="onKeydown($event)" rows="1" maxlength="4000" placeholder="Conte um pouco sobre o que você gosta de ler..." [disabled]="disabled()" aria-label="Escreva sua mensagem"></textarea>
      <button type="submit" class="send-button" [disabled]="disabled() || !draft.trim()" aria-label="Enviar mensagem"><lucide-icon [img]="ArrowUp" [size]="19" /></button>
      <span class="sr-only" aria-live="polite">{{ disabled() ? 'A Luma está pensando' : '' }}</span>
    </form>
  `,
  styles: [`
    :host { display: block; }
    .composer { display: flex; align-items: flex-end; gap: 12px; padding: 12px 12px 12px 20px; background: #fff; border: 1px solid #e9e4db; border-radius: 20px; box-shadow: 0 5px 25px #41351d0c; transition: border-color .2s, box-shadow .2s; }
    .composer:focus-within { border-color: #b9c4ae; box-shadow: 0 5px 26px #53674c12; }
    textarea { flex: 1; resize: none; max-height: 150px; padding: 8px 0; border: 0; outline: none; background: transparent; color: #3e3a33; font: inherit; font-size: 14px; line-height: 1.55; }
    textarea::placeholder { color: #a49d92; }
    .send-button { width: 38px; height: 38px; flex: 0 0 38px; display: grid; place-items: center; border: 0; border-radius: 13px; background: #52654d; color: #fff; cursor: pointer; transition: background .2s, transform .2s; }
    .send-button:not(:disabled):hover { background: #3f513b; transform: translateY(-1px); }
    .send-button:disabled { background: #ddd9d1; cursor: not-allowed; }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
  `],
})
export class ChatInputComponent {
  readonly disabled = input(false);
  readonly send = output<string>();
  readonly messageField = viewChild<ElementRef<HTMLTextAreaElement>>('messageField');
  readonly ArrowUp = ArrowUp;
  draft = '';

  submit(): void {
    const message = this.draft.trim();
    if (!message || this.disabled()) return;
    this.send.emit(message);
    this.draft = '';
    const textarea = this.messageField()?.nativeElement;
    if (textarea) textarea.style.height = 'auto';
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submit();
      return;
    }
    queueMicrotask(() => {
      const textarea = this.messageField()?.nativeElement;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
      }
    });
  }
}
