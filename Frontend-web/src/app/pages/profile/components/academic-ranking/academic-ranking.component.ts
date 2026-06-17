import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RankingRow } from '../../models/profile.model';

@Component({
  selector: 'app-academic-ranking',
  imports: [DecimalPipe],
  templateUrl: './academic-ranking.component.html',
  styleUrl: './academic-ranking.component.scss',
})
export class AcademicRankingComponent {
  readonly ranking = input.required<{
    currentPosition: number;
    totalStudents: number;
    points: number;
    rows: RankingRow[];
  }>();
}
