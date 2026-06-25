import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BackendContent } from './content.service';

export interface BackendSavedContent {
  id: number | string;
  user_id: number | string;
  content_id: number | string;
  created_at?: string | null;
  content?: BackendContent | null;
}

interface PaginatedSavedContentResponse {
  data: BackendSavedContent[];
}

@Injectable({ providedIn: 'root' })
export class SavedContentService {
  private readonly http = inject(HttpClient);

  async getMine(): Promise<BackendSavedContent[]> {
    const response = await firstValueFrom(
      this.http.get<BackendSavedContent[] | PaginatedSavedContentResponse>('/my-saved-contents'),
    );

    return Array.isArray(response) ? response : response.data;
  }

  async save(contentId: string | number): Promise<BackendSavedContent> {
    const response = await firstValueFrom(
      this.http.post<{ data: BackendSavedContent }>('/saved-contents', { content_id: contentId }),
    );

    return response.data;
  }

  async remove(contentId: string | number): Promise<void> {
    await firstValueFrom(this.http.delete(`/saved-contents/${contentId}`));
  }
}
