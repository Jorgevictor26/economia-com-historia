import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-content-forum-action',
  imports: [RouterLink],
  template: `
    @if (contentId) {
      <a
        class="content-forum-action-button"
        [routerLink]="['/app/forums']"
        [queryParams]="{ content: contentId, returnUrl: returnUrl }"
        [attr.aria-label]="ariaLabel"
        [title]="ariaLabel"
      >
        <span class="material-symbols-outlined text-[24px] leading-none" aria-hidden="true">forum</span>
        <span class="content-forum-action-label">Criar fórum</span>
      </a>
    }
  `,
})
export class ContentForumActionComponent {
  @Input({ required: true }) contentId = '';
  @Input() contentTitle = '';

  get returnUrl(): string {
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
  }

  get ariaLabel(): string {
    return this.contentTitle
      ? `Criar fórum sobre ${this.contentTitle}`
      : 'Criar fórum sobre este conteúdo';
  }
}
