import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface AdminDashboardMetricSummary {
  articles_published: number;
  pending_contents: number;
  today_comments: number;
  today_notifications: number;
  active_users: number;
  total_users: number;
  total_contents: number;
  total_quizzes: number;
  total_forums: number;
  pending_reports: number;
  private_forums: number;
}

export interface AdminDashboardContentMixItem {
  label: string;
  count: number;
  value: number;
}

export interface AdminDashboardActivity {
  title: string;
  meta: string;
  icon: string;
  tone: 'content' | 'user' | 'forum' | 'report';
  created_at?: string | null;
}

export interface AdminDashboardOverview {
  metrics: AdminDashboardMetricSummary;
  content_mix: AdminDashboardContentMixItem[];
  activities: AdminDashboardActivity[];
}

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private readonly http = inject(HttpClient);

  getOverview(): Promise<AdminDashboardOverview> {
    return firstValueFrom(this.http.get<AdminDashboardOverview>('/admin/dashboard'));
  }
}
