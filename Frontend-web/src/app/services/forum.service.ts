import { Injectable, signal } from '@angular/core';
import { ForumRoom } from '../models/forum.model';

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
    },
    {
      id: 'privada-jindungo',
      name: 'Mesa Jindungo',
      visibility: 'private',
      members: 214,
      activeDebates: 7,
      description: 'Sala premium para leituras profundas e encontros com especialistas.',
    },
  ]);
}
