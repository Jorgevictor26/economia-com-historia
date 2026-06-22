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

@Injectable({ providedIn: 'root' })
export class ReactionService {
  private readonly http = inject(HttpClient);

  getCountByType(contentId: string): Promise<ReactionCount[]> {
    return firstValueFrom(this.http.get<ReactionCount[]>(`/reactions/content/${contentId}/count`));
  }

  create(contentId: string, reactionType: ReactionType = 'like'): Promise<MutationResponse<unknown>> {
    return firstValueFrom(this.http.post<MutationResponse<unknown>>('/reactions', {
      content_id: contentId,
      reaction_type: reactionType,
    }));
  }
}
