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
}

