import { Component, input } from '@angular/core';
import { Achievement, RankingAchievement } from '../../models/profile.model';

@Component({
  selector: 'app-achievements',
  templateUrl: './achievements.component.html',
  styleUrl: './achievements.component.scss',
})
export class AchievementsComponent {
  readonly achievements = input.required<Achievement[]>();
  readonly rankingAchievements = input.required<RankingAchievement[]>();

  readonly topFiveRankingAchievements = () =>
    this.rankingAchievements().filter((achievement) => achievement.position <= 5);
}
