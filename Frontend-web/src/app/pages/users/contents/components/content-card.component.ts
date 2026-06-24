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
  @Output() gatedAction = new EventEmitter<{ event: Event; operation: string }>();

  get contentRoute(): unknown[] {
    if (this.isPodcastContent()) {
      return ['/app/podcasts', this.content.id];
    }

    if (this.isVideoContent()) {
      return ['/app/contents/videos', this.content.id];
    }

    return ['/app/contents', this.content.id];
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

