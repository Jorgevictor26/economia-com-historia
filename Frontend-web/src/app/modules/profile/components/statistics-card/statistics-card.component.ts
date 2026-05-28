import { Component, input } from '@angular/core';
import { ProfileStats } from '../../models/profile.model';

@Component({
  selector: 'app-statistics-card',
  templateUrl: './statistics-card.component.html',
  styleUrl: './statistics-card.component.scss',
})
export class StatisticsCardComponent {
  readonly stats = input.required<ProfileStats>();
}
