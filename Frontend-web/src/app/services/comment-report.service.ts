import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, firstValueFrom, throwError } from 'rxjs';

export type CommentReportReason = 'spam' | 'offensive_comment' | 'fake_information' | 'copyright' | 'other';

interface MutationResponse<T> {
  data: T;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class CommentReportService {
  private readonly http = inject(HttpClient);

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

