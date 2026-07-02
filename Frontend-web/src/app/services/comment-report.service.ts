import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, firstValueFrom, throwError } from 'rxjs';

export type CommentReportReason = 'spam' | 'offensive_comment' | 'fake_information' | 'copyright' | 'other';
export type BackendCommentReportStatus = 'pending' | 'approved' | 'rejected';

interface MutationResponse<T> {
  data: T;
  message?: string;
}

interface BackendRelation {
  id: number | string;
  name: string;
  email?: string | null;
}

export interface BackendReportedContent {
  id: number | string;
  title: string;
  summary?: string | null;
  category?: { id: number | string; name: string } | null;
  content_type?: { id: number | string; name: string; slug?: string } | null;
  author?: BackendRelation | null;
  user?: BackendRelation | null;
}

export interface BackendReportedComment {
  id: number | string;
  comment: string;
  hidden_at?: string | null;
  user?: BackendRelation | null;
  content?: BackendReportedContent | null;
}

export interface BackendCommentReport {
  id: number | string;
  comment_id: number | string;
  reason: CommentReportReason | string;
  description?: string | null;
  status: BackendCommentReportStatus | string;
  created_at?: string | null;
  updated_at?: string | null;
  user?: BackendRelation | null;
  reviewer?: BackendRelation | null;
  comment?: BackendReportedComment | null;
}

export interface CommentReportPagination {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

export interface CommentReportPage {
  data: BackendCommentReport[];
  pagination: CommentReportPagination;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

@Injectable({ providedIn: 'root' })
export class CommentReportService {
  private readonly http = inject(HttpClient);

  async getAll(options: { search?: string; status?: BackendCommentReportStatus | 'all'; perPage?: number } = {}): Promise<CommentReportPage> {
    const params: Record<string, string> = {
      per_page: String(options.perPage ?? 100),
    };

    if (options.search?.trim()) {
      params['search'] = options.search.trim();
    }

    if (options.status && options.status !== 'all') {
      params['status'] = options.status;
    }

    const response = await firstValueFrom(
      this.http.get<PaginatedResponse<BackendCommentReport>>('/comment-reports', { params }).pipe(
        catchError((error) => throwError(() => new Error(this.extractMessage(error)))),
      ),
    );

    return {
      data: response.data,
      pagination: {
        currentPage: response.current_page ?? 1,
        lastPage: response.last_page ?? 1,
        perPage: response.per_page ?? response.data.length,
        total: response.total ?? response.data.length,
      },
    };
  }

  create(commentId: string | number, reason: CommentReportReason, description?: string): Promise<MutationResponse<unknown>> {
    return firstValueFrom(
      this.http.post<MutationResponse<unknown>>('/comment-reports', {
        comment_id: commentId,
        reason,
        description: description?.trim() || null,
      }).pipe(
        catchError((error) => throwError(() => new Error(this.extractMessage(error)))),
      ),
    );
  }

  async approve(id: string | number): Promise<BackendCommentReport> {
    const response = await firstValueFrom(
      this.http.patch<MutationResponse<BackendCommentReport>>(`/comment-reports/${id}/approve`, {}).pipe(
        catchError((error) => throwError(() => new Error(this.extractMessage(error)))),
      ),
    );

    return response.data;
  }

  async reject(id: string | number): Promise<BackendCommentReport> {
    const response = await firstValueFrom(
      this.http.patch<MutationResponse<BackendCommentReport>>(`/comment-reports/${id}/reject`, {}).pipe(
        catchError((error) => throwError(() => new Error(this.extractMessage(error)))),
      ),
    );

    return response.data;
  }

  private extractMessage(error: unknown): string {
    const response = error as { error?: { message?: string; errors?: Record<string, string[]> } };
    const errors = response.error?.errors;

    if (errors) {
      const firstError = Object.values(errors)[0]?.[0];

      if (firstError) {
        return firstError;
      }
    }

    return response.error?.message ?? 'Não foi possível enviar a denúncia.';
  }
}
