import { Component, input } from '@angular/core';
import { Achievement } from '../../models/profile.model';

@Component({
  selector: 'app-achievements',
  templateUrl: './achievements.component.html',
  styleUrl: './achievements.component.scss',
})
export class AchievementsComponent {
  readonly achievements = input.required<Achievement[]>();
}
