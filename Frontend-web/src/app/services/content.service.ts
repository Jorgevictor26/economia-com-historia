import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Content } from '../models/content.model';

interface BackendRelation {
  id: number | string;
  name: string;
  slug?: string;
  bio?: string | null;
  photo?: string | null;
  avatar?: string | null;
  avatar_url?: string | null;
  avatarUrl?: string | null;
  profile_photo?: string | null;
  profilePhoto?: string | null;
}

export interface BackendContent {
  id: number | string;
  user_id?: number | string;
  author_id?: number | string;
  title: string;
  summary?: string | null;
  content?: string | null;
  image_url?: string | null;
  video_url?: string | null;
  audio_url?: string | null;
  document_url?: string | null;
  visibility?: string;
  views_count?: number | string;
  created_at?: string | null;
  updated_at?: string | null;
  author?: BackendRelation | null;
  user?: BackendRelation | null;
  author_photo?: string | null;
  author_photo_url?: string | null;
  authorPhotoUrl?: string | null;
  user_photo?: string | null;
  user_photo_url?: string | null;
  userPhotoUrl?: string | null;
  photo?: string | null;
  avatar?: string | null;
  avatar_url?: string | null;
  avatarUrl?: string | null;
  category?: BackendRelation | null;
  content_type?: BackendRelation | null;
  reactions_count?: number | string;
  comments_count?: number | string;
  shares_count?: number | string;
  share_count?: number | string;
  shared_count?: number | string;
  liked_by_me?: boolean | number;
  can_access?: boolean;
  subscription_status?: 'available' | 'pending' | 'approved' | 'rejected' | 'expired' | string;
}

export interface BackendContentProgress {
  id: number | string;
  content_id: number | string;
  progress_percent: number | string;
  last_position_seconds?: number | string | null;
  updated_at?: string | null;
  content?: BackendContent | null;
}

export interface ContentPagination {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number | null;
  to?: number | null;
}

export interface ContentPage {
  data: BackendContent[];
  pagination: ContentPagination;
}

export interface ContentQuery {
  page?: number;
  perPage?: number;
  search?: string;
  type?: string;
  categoryId?: number | string;
  contentTypeId?: number | string;
}

export interface ContentPayload {
  title: string;
  summary?: string | null;
  category_id?: number | null;
  content_type_id: number;
  content: string;
  image_url?: string | null;
  video_url?: string | null;
  visibility: 'public' | 'private' | 'followers';
}

export interface UpdateContentProgressPayload {
  progress_percent: number;
  last_position_seconds?: number | null;
}

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);
  private readonly contentsSignal = signal<Content[]>([]);

  readonly contents = this.contentsSignal.asReadonly();

  async getAll(query: ContentQuery = {}): Promise<ContentPage> {
    let params = new HttpParams();

    if (query.page) {
      params = params.set('page', query.page);
    }

    if (query.perPage) {
      params = params.set('per_page', query.perPage);
    }

    if (query.search) {
      params = params.set('search', query.search);
    }

    if (query.type) {
      params = params.set('type', query.type);
    }

    if (query.categoryId) {
      params = params.set('category_id', query.categoryId);
    }

    if (query.contentTypeId) {
      params = params.set('content_type_id', query.contentTypeId);
    }

    const response = await firstValueFrom(this.http.get<BackendContent[] | PaginatedResponse<BackendContent>>('/contents', { params }));

    if (Array.isArray(response)) {
      return {
        data: response,
        pagination: {
          currentPage: 1,
          lastPage: 1,
          perPage: response.length,
          total: response.length,
          from: response.length > 0 ? 1 : 0,
          to: response.length,
        },
      };
    }

    return {
      data: response.data,
      pagination: {
        currentPage: response.current_page ?? 1,
        lastPage: response.last_page ?? 1,
        perPage: response.per_page ?? response.data.length,
        total: response.total ?? response.data.length,
        from: response.from ?? (response.data.length > 0 ? 1 : 0),
        to: response.to ?? response.data.length,
      },
    };
  }

  async getById(id: string): Promise<BackendContent> {
    return firstValueFrom(this.http.get<BackendContent>(`/contents/${id}`));
  }

  async getSuggestions(limit = 9): Promise<BackendContent[]> {
    const params = new HttpParams().set('limit', Math.min(Math.max(limit, 1), 12));

    return firstValueFrom(this.http.get<BackendContent[]>('/contents/suggestions', { params }));
  }

  async getFeaturedJindungo(): Promise<BackendContent> {
    return firstValueFrom(this.http.get<BackendContent>('/contents/jindungo/featured'));
  }

  async getProgress(limit = 3): Promise<BackendContentProgress[]> {
    const params = new HttpParams().set('limit', Math.min(Math.max(limit, 1), 6));

    return firstValueFrom(this.http.get<BackendContentProgress[]>('/content-progress', { params }));
  }

  async updateProgress(contentId: string | number, payload: UpdateContentProgressPayload): Promise<BackendContentProgress> {
    const response = await firstValueFrom(
      this.http.put<{ data: BackendContentProgress }>(`/contents/${contentId}/progress`, payload),
    );

    return response.data;
  }

  async create(payload: ContentPayload): Promise<BackendContent> {
    const response = await firstValueFrom(this.http.post<{ data: BackendContent }>('/contents', payload));

    return response.data;
  }

  async update(id: number | string, payload: Partial<ContentPayload>): Promise<BackendContent> {
    const response = await firstValueFrom(this.http.put<{ data: BackendContent }>(`/contents/${id}`, payload));

    return response.data;
  }

  async delete(id: number | string): Promise<void> {
    await firstValueFrom(this.http.delete(`/contents/${id}`));
  }

  async uploadMedia(id: number | string, mediaType: 'image' | 'video' | 'audio' | 'document', file: File): Promise<BackendContent> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await firstValueFrom(
      this.http.post<{ data: BackendContent }>(`/contents/${id}/media/${mediaType}`, formData),
    );

    return response.data;
  }
}
