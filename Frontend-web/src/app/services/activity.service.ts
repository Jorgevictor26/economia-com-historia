import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

export interface HistoryContent {
  id: number | string;
  title: string;
  summary?: string | null;
  image_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  category?: string | null;
  content_type?: string | null;
  author_name?: string | null;
}

export interface HistoryQuiz {
  id: number | string;
  title: string;
  completed_at?: string | null;
  score?: number | null;
  category?: string | null;
  type: 'quiz';
}

export interface ForumActivity {
  id: number | string;
  title: string;
  created_at?: string | null;
  type: 'forum';
}

export interface UserActivity {
  recent_contents: HistoryContent[];
  recent_quizzes: HistoryQuiz[];
  forum_activity: ForumActivity[];
}

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private readonly http = inject(HttpClient);

  async getHistory(limit = 10): Promise<UserActivity> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<UserActivity>>('/activity/history', {
        params: { limit: Math.min(limit, 50) }
      })
    );

    return response.data;
  }
}
