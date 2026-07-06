import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentListItem } from '../../../../models/content-list-item.model';

@Component({
  selector: 'app-content-card',
  imports: [RouterLink],
  templateUrl: './content-card.component.html'
})
export class ContentCardComponent {
  @Input({ required: true }) content!: ContentListItem;
  @Input() canReadPremium = false;
  @Output() contentAction = new EventEmitter<{ event: Event; operation: string; content: ContentListItem }>();

  get isPremiumUnlocked(): boolean {
    return this.canReadPremium || Boolean(this.content.canReadPremium);
  }

  get primaryBadgeLabel(): string {
    return this.content.category || this.content.contentType;
  }

  get showContentTypeBadge(): boolean {
    return !this.content.premium && this.normalize(this.content.contentType) !== this.normalize(this.content.category);
  }

  get contentRoute(): unknown[] {
    if (this.content.premium && !this.isPremiumUnlocked) {
      return ['/app/contents', this.content.id];
    }

    if (this.isPodcastContent()) {
      return ['/app/podcasts', this.content.id];
    }

    if (this.isVideoContent()) {
      return ['/app/contents/videos', this.content.id];
    }

    return ['/app/contents', this.content.id];
  }

  handleContentOpen(event: Event): void {
    if (!this.content.premium || this.isPremiumUnlocked) {
      return;
    }

    this.contentAction.emit({ event, operation: 'pedir subscrição Jindungo', content: this.content });
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private isPodcastContent(): boolean {
    return [this.content.contentType, this.content.category, this.content.meta, this.content.title]
      .filter(Boolean)
      .some((value) => this.normalize(value).includes('podcast') || this.normalize(value).startsWith('ep.'));
  }

  private isVideoContent(): boolean {
    return [this.content.contentType, this.content.category, this.content.meta, this.content.title]
      .filter(Boolean)
      .some((value) => this.normalize(value).includes('video') || this.normalize(value).includes('video-aula'));
  }
}
