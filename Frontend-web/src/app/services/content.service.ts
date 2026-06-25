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
}

export interface BackendContent {
  id: number | string;
  title: string;
  summary?: string | null;
  content?: string | null;
  image?: string | null;
  video?: string | null;
  visibility?: string;
  created_at?: string | null;
  updated_at?: string | null;
  author?: BackendRelation | null;
  user?: BackendRelation | null;
  category?: BackendRelation | null;
  content_type?: BackendRelation | null;
  reactions_count?: number | string;
  comments_count?: number | string;
  liked_by_me?: boolean | number;
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
  search?: string;
  categoryId?: number | string;
  contentTypeId?: number | string;
}

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);
  private readonly contentsSignal = signal<Content[]>([
    {
      id: '1',
      title: 'A economia do cafe no planalto angolano',
      excerpt: 'Uma leitura historica sobre exportacao, trabalho e transformacao regional.',
      type: 'historia',
      status: 'published',
      author: 'Equipa editorial',
      coverUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      premium: false,
      publishedAt: '2026-05-01',
      readingMinutes: 8,
    },
    {
      id: '2',
      title: 'Inflacao, moeda e memoria social',
      excerpt: 'Conceitos economicos explicados com exemplos do quotidiano angolano.',
      type: 'economia',
      status: 'published',
      author: 'Núcleo académico',
      coverUrl: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
      premium: false,
      publishedAt: '2026-05-08',
      readingMinutes: 6,
    },
    {
      id: '3',
      title: 'Textos com Jindungo: petroleo e soberania',
      excerpt: 'Análise premium com contexto, dados e perguntas para debate.',
      type: 'jindungo',
      status: 'published',
      author: 'Jindungo Lab',
      coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1200&q=80',
      premium: true,
      publishedAt: '2026-05-12',
      readingMinutes: 12,
    },
  ]);

  readonly contents = this.contentsSignal.asReadonly();

  async getAll(query: ContentQuery = {}): Promise<ContentPage> {
    let params = new HttpParams();

    if (query.page) {
      params = params.set('page', query.page);
    }

    if (query.search) {
      params = params.set('search', query.search);
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
}
