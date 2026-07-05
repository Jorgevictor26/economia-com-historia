import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ForumRoom } from '../models/forum.model';
import { BackendContent } from './content.service';

export interface ForumArtifactPayload {
  id: string;
  name: string;
  type: string;
  size: number;
  data_url: string;
}

export interface BackendForum {
  id: number | string;
  user_id?: number | string;
  name: string;
  description?: string | null;
  rules?: string | null;
  category?: string | null;
  image_url?: string | null;
  visibility?: 'public' | 'private' | string;
  access_code?: string | null;
  join_approval_required?: boolean | number;
  content_permission?: 'public' | 'subscribers' | string;
  allow_attachments?: boolean | number;
  status?: 'pending' | 'approved' | 'rejected' | string;
  created_at?: string | null;
  updated_at?: string | null;
  topics_count?: number;
  members_count?: number;
  access_status?: 'none' | 'pending' | 'invited' | 'member' | 'rejected' | string;
  can_view?: boolean;
  invite_emails?: string[];
  artifacts?: ForumArtifactPayload[];
  topics?: BackendForumTopic[];
  user?: {
    id: number | string;
    name: string;
    photo?: string | null;
  } | null;
  contents?: BackendContent[];
}

export interface BackendForumTopic {
  id: number | string;
  forum_id: number | string;
  user_id?: number | string;
  title: string;
  content: string;
  created_at?: string | null;
  updated_at?: string | null;
  replies_count?: number;
  user?: {
    id: number | string;
    name: string;
    photo?: string | null;
  } | null;
  replies?: BackendForumReply[];
}

export interface BackendForumReply {
  id: number | string;
  topic_id: number | string;
  user_id?: number | string;
  reply: string;
  created_at?: string | null;
  updated_at?: string | null;
  user?: {
    id: number | string;
    name: string;
    photo?: string | null;
  } | null;
}

export interface CreateForumPayload {
  name: string;
  description?: string | null;
  rules?: string | null;
  category?: string | null;
  image?: string | null;
  visibility?: 'public' | 'private';
  access_code?: string | null;
  join_approval_required?: boolean;
  content_permission?: 'public' | 'subscribers';
  allow_attachments?: boolean;
  artifacts?: ForumArtifactPayload[];
  content_ids?: Array<number | string>;
  invite_emails?: string[];
}

export type UpdateForumPayload = Partial<CreateForumPayload>;

@Injectable({ providedIn: 'root' })
export class ForumService {
  private readonly http = inject(HttpClient);

  readonly rooms = signal<ForumRoom[]>([]);

  async getAll(search = ''): Promise<BackendForum[]> {
    let params = new HttpParams();

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return firstValueFrom(this.http.get<BackendForum[]>('/forums', { params }));
  }

  async getById(id: number | string): Promise<BackendForum> {
    return firstValueFrom(this.http.get<BackendForum>(`/forums/${id}`));
  }

  async create(payload: CreateForumPayload): Promise<BackendForum> {
    const normalizedPayload = {
      ...payload,
      content_ids: (payload.content_ids ?? [])
        .map((id) => (typeof id === 'string' ? Number(id) : id))
        .filter((id) => id !== null && id !== undefined && !Number.isNaN(Number(id))),
      invite_emails: (payload.invite_emails ?? []).filter(Boolean),
    };
    const response = await firstValueFrom(this.http.post<{ data: BackendForum }>('/forums', normalizedPayload));

    return response.data;
  }

  async requestJoin(id: number | string): Promise<BackendForum> {
    const response = await firstValueFrom(this.http.post<{ data: BackendForum }>(`/forums/${id}/join-request`, {}));

    return response.data;
  }

  async acceptInvitation(id: number | string): Promise<BackendForum> {
    const response = await firstValueFrom(this.http.post<{ data: BackendForum }>(`/forums/${id}/accept-invitation`, {}));

    return response.data;
  }

  async invite(id: number | string, emails: string[]): Promise<BackendForum> {
    const response = await firstValueFrom(this.http.post<{ data: BackendForum }>(`/forums/${id}/invite`, { emails }));

    return response.data;
  }

  async update(id: number | string, payload: UpdateForumPayload): Promise<BackendForum> {
    const response = await firstValueFrom(this.http.put<{ data: BackendForum }>(`/forums/${id}`, payload));

    return response.data;
  }

  async delete(id: number | string): Promise<void> {
    await firstValueFrom(this.http.delete(`/forums/${id}`));
  }

  async getTopics(forumId: number | string): Promise<BackendForumTopic[]> {
    return firstValueFrom(this.http.get<BackendForumTopic[]>(`/forums/${forumId}/topics`));
  }

  async getTopic(topicId: number | string): Promise<BackendForumTopic> {
    return firstValueFrom(this.http.get<BackendForumTopic>(`/topics/${topicId}`));
  }

  async createTopic(forumId: number | string, title: string, content: string): Promise<BackendForumTopic> {
    const response = await firstValueFrom(
      this.http.post<{ data: BackendForumTopic }>(`/forums/${forumId}/topics`, { title, content }),
    );

    return response.data;
  }

  async updateTopic(topicId: number | string, title: string, content: string): Promise<BackendForumTopic> {
    const response = await firstValueFrom(
      this.http.put<{ data: BackendForumTopic }>(`/topics/${topicId}`, { title, content }),
    );

    return response.data;
  }

  async deleteTopic(topicId: number | string): Promise<void> {
    await firstValueFrom(this.http.delete(`/topics/${topicId}`));
  }

  async getReplies(topicId: number | string): Promise<BackendForumReply[]> {
    return firstValueFrom(this.http.get<BackendForumReply[]>(`/topics/${topicId}/replies`));
  }

  async createReply(topicId: number | string, reply: string): Promise<BackendForumReply> {
    const response = await firstValueFrom(
      this.http.post<{ data: BackendForumReply }>(`/topics/${topicId}/replies`, { reply }),
    );

    return response.data;
  }

  async updateReply(replyId: number | string, reply: string): Promise<BackendForumReply> {
    const response = await firstValueFrom(
      this.http.put<{ data: BackendForumReply }>(`/replies/${replyId}`, { reply }),
    );

    return response.data;
  }

  async deleteReply(replyId: number | string): Promise<void> {
    await firstValueFrom(this.http.delete(`/replies/${replyId}`));
  }

}
