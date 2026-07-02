import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ForumLinkedContent, ForumRoom } from '../models/forum.model';
import { BackendContent } from './content.service';

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
  replies_count?: number;
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
  content_ids?: Array<number | string>;
}

export type UpdateForumPayload = Partial<CreateForumPayload>;

export interface CreateForumRoomPayload {
  name: string;
  category: string;
  objective: string;
  visibility: 'public' | 'private';
  accessCode?: string | null;
  joinApprovalRequired?: boolean;
  inviteEmails: string[];
  protectedByPassword: boolean;
  linkedContents: ForumLinkedContent[];
}

@Injectable({ providedIn: 'root' })
export class ForumService {
  private readonly http = inject(HttpClient);

  readonly rooms = signal<ForumRoom[]>([
    {
      id: 'publica-economia',
      name: 'Economia no quotidiano',
      visibility: 'public',
      accessCode: null,
      joinApprovalRequired: false,
      members: 1280,
      activeDebates: 18,
      description: 'Debates moderados sobre precos, trabalho, banca e politicas publicas.',
      category: 'Economia',
      objective: 'Debater economia aplicada a partir de conteudos publicados.',
      inviteEmails: [],
      protectedByPassword: false,
      linkedContents: [
        { id: '2', title: 'Inflacao, moeda e memoria social', type: 'Artigo Académico', meta: '6 min de leitura' },
      ],
    },
    {
      id: 'privada-jindungo',
      name: 'Mesa Jindungo',
      visibility: 'private',
      accessCode: 'EH-JINDUNGO',
      joinApprovalRequired: true,
      members: 214,
      activeDebates: 7,
      description: 'Sala premium para leituras profundas e encontros com especialistas.',
      category: 'Jindungo',
      objective: 'Aprofundar leituras premium e encontros com especialistas.',
      inviteEmails: ['estudante@academia.ao'],
      protectedByPassword: true,
      linkedContents: [
        { id: '3', title: 'Textos com Jindungo: petroleo e soberania', type: 'Jindungo', meta: '12 min de leitura' },
      ],
    },
  ]);

  createRoom(payload: CreateForumRoomPayload): ForumRoom {
    const room: ForumRoom = {
      id: `room-${Date.now()}`,
      name: payload.name,
      visibility: payload.visibility,
      accessCode: payload.visibility === 'private' ? (payload.accessCode ?? this.generateAccessCode()) : null,
      joinApprovalRequired: payload.visibility === 'private' ? (payload.joinApprovalRequired ?? true) : false,
      members: 1,
      activeDebates: 0,
      description: payload.objective,
      category: payload.category,
      objective: payload.objective,
      inviteEmails: payload.inviteEmails,
      protectedByPassword: payload.protectedByPassword,
      linkedContents: payload.linkedContents,
    };

    this.rooms.update((rooms) => [room, ...rooms]);

    return room;
  }

  async getAll(search = ''): Promise<BackendForum[]> {
    let params = new HttpParams();

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return firstValueFrom(this.http.get<BackendForum[]>('/forums', { params }));
  }

  async create(payload: CreateForumPayload): Promise<BackendForum> {
    const response = await firstValueFrom(this.http.post<{ data: BackendForum }>('/forums', payload));

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

  async createTopic(forumId: number | string, title: string, content: string): Promise<BackendForumTopic> {
    const response = await firstValueFrom(
      this.http.post<{ data: BackendForumTopic }>(`/forums/${forumId}/topics`, { title, content }),
    );

    return response.data;
  }

  private generateAccessCode(): string {
    return `EH-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }
}

