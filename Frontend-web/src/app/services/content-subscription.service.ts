import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BackendContent } from './content.service';

export interface BackendContentSubscription {
  id: number | string;
  user_id: number | string;
  content_id: number | string;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | string;
  requested_at?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  expires_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  user?: {
    id: number | string;
    name: string;
    email: string;
  } | null;
  content?: BackendContent | null;
}

interface MutationResponse<T> {
  data: T;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class ContentSubscriptionService {
  private readonly http = inject(HttpClient);

  async getAll(options: { status?: string; search?: string } = {}): Promise<BackendContentSubscription[]> {
    let params = new HttpParams();

    if (options.status) {
      params = params.set('status', options.status);
    }

    if (options.search?.trim()) {
      params = params.set('search', options.search.trim());
    }

    return firstValueFrom(this.http.get<BackendContentSubscription[]>('/content-subscriptions', { params }));
  }

  async mine(): Promise<BackendContentSubscription[]> {
    return firstValueFrom(this.http.get<BackendContentSubscription[]>('/my-content-subscriptions'));
  }

  async request(contentId: string | number): Promise<BackendContentSubscription> {
    const response = await firstValueFrom(
      this.http.post<MutationResponse<BackendContentSubscription>>(`/contents/${contentId}/subscriptions`, {}),
    );

    return response.data;
  }

  async approve(id: string | number): Promise<BackendContentSubscription> {
    const response = await firstValueFrom(
      this.http.patch<MutationResponse<BackendContentSubscription>>(`/content-subscriptions/${id}/approve`, {}),
    );

    return response.data;
  }

  async reject(id: string | number): Promise<BackendContentSubscription> {
    const response = await firstValueFrom(
      this.http.patch<MutationResponse<BackendContentSubscription>>(`/content-subscriptions/${id}/reject`, {}),
    );

    return response.data;
  }

  async expire(id: string | number): Promise<BackendContentSubscription> {
    const response = await firstValueFrom(
      this.http.patch<MutationResponse<BackendContentSubscription>>(`/content-subscriptions/${id}/expire`, {}),
    );

    return response.data;
  }

  async delete(id: string | number): Promise<void> {
    await firstValueFrom(this.http.delete(`/content-subscriptions/${id}`));
  }
}
