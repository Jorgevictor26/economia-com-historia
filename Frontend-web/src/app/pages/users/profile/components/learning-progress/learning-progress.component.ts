import { Component, input } from '@angular/core';
import { LearningProgress } from '../../../../../models/profile.model';

@Component({
  selector: 'app-learning-progress',
  templateUrl: './learning-progress.component.html',
  styleUrl: './learning-progress.component.scss',
})
export class LearningProgressComponent {
  readonly learning = input.required<LearningProgress>();
}


