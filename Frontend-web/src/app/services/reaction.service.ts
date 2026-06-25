import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export interface ReactionCount {
  reaction_type: ReactionType;
  count: number | string;
}

interface MutationResponse<T> {
  data: T;
  message?: string;
}

export interface ReactionToggleResult {
  reacted: boolean;
  reactions_count: number | string;
  reaction?: unknown;
}

interface ListResponse<T> {
  data: T[];
}

@Injectable({ providedIn: 'root' })
export class ReactionService {
  private readonly http = inject(HttpClient);

  async getCountByType(contentId: string): Promise<ReactionCount[]> {
    const response = await firstValueFrom(
      this.http.get<ReactionCount[] | ListResponse<ReactionCount>>(`/reactions/content/${contentId}/count`),
    );

    return Array.isArray(response) ? response : response.data;
  }

  toggle(contentId: string, reactionType: ReactionType = 'like'): Promise<MutationResponse<ReactionToggleResult>> {
    return firstValueFrom(this.http.post<MutationResponse<ReactionToggleResult>>('/reactions', {
      content_id: contentId,
      reaction_type: reactionType,
    }));
  }

  create(contentId: string, reactionType: ReactionType = 'like'): Promise<MutationResponse<ReactionToggleResult>> {
    return this.toggle(contentId, reactionType);
  }
}
