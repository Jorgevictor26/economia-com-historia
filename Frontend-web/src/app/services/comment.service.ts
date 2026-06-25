import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

interface BackendUser {
  id: number | string;
  name: string;
}

export interface BackendCommentReply {
  id: number | string;
  reply: string;
  created_at?: string | null;
  user?: BackendUser | null;
}

export interface BackendComment {
  id: number | string;
  comment: string;
  created_at?: string | null;
  user?: BackendUser | null;
  replies?: BackendCommentReply[];
}

interface MutationResponse<T> {
  data: T;
  message?: string;
}

interface ListResponse<T> {
  data: T[];
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  private readonly http = inject(HttpClient);

  async getByContent(contentId: string): Promise<BackendComment[]> {
    const response = await firstValueFrom(
      this.http.get<BackendComment[] | ListResponse<BackendComment>>(`/comments/content/${contentId}`),
    );

    return Array.isArray(response) ? response : response.data;
  }

  create(contentId: string, comment: string): Promise<MutationResponse<BackendComment>> {
    return firstValueFrom(this.http.post<MutationResponse<BackendComment>>('/comments', {
      content_id: contentId,
      comment,
    }));
  }

  reply(commentId: string, reply: string): Promise<MutationResponse<BackendCommentReply>> {
    return firstValueFrom(this.http.post<MutationResponse<BackendCommentReply>>(`/comments/${commentId}/reply`, {
      reply,
    }));
  }
}
