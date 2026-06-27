import { Injectable, signal } from '@angular/core';
import { ForumLinkedContent, ForumRoom } from '../models/forum.model';

export interface CreateForumRoomPayload {
  name: string;
  category: string;
  objective: string;
  visibility: 'public' | 'private';
  inviteEmails: string[];
  protectedByPassword: boolean;
  linkedContents: ForumLinkedContent[];
}

@Injectable({ providedIn: 'root' })
export class ForumService {
  readonly rooms = signal<ForumRoom[]>([
    {
      id: 'publica-economia',
      name: 'Economia no quotidiano',
      visibility: 'public',
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
}
