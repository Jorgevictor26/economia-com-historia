import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type AdminStatisticsPeriod = 'Diario' | 'Semanal' | 'Mensal';

export interface AdminStatisticsRow {
  label: string;
  value: number;
  detail: string;
  percent?: number;
}

export interface AdminStatisticsPerformanceRow {
  name: string;
  views: number;
  engagement: string;
  score: number;
}

export interface AdminStatisticsOverview {
  summary: {
    total_views: number;
    total_reactions: number;
    total_comments: number;
    user_growth_percent: number;
  };
  evolution: Array<{ label: string; value: number; percent: number }>;
  content_views: AdminStatisticsRow[];
  category_views: AdminStatisticsRow[];
  reaction_breakdown: AdminStatisticsRow[];
  comment_periods: AdminStatisticsRow[];
  user_growth: AdminStatisticsRow[];
  author_performance: AdminStatisticsPerformanceRow[];
  category_performance: AdminStatisticsPerformanceRow[];
  forum_stats: AdminStatisticsRow[];
  quiz_stats: AdminStatisticsRow[];
}

@Injectable({ providedIn: 'root' })
export class AdminStatisticsService {
  private readonly http = inject(HttpClient);

  getOverview(period: AdminStatisticsPeriod): Promise<AdminStatisticsOverview> {
    const params = new HttpParams().set('period', period.toLowerCase());

    return firstValueFrom(this.http.get<AdminStatisticsOverview>('/admin/statistics', { params }));
  }
}
