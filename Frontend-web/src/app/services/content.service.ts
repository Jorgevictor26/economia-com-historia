import { Injectable, signal } from '@angular/core';
import { Content } from '../models/content.model';

@Injectable({ providedIn: 'root' })
export class ContentService {
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
      excerpt: 'Analise premium com contexto, dados e perguntas para debate.',
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

  getById(id: string): Content | undefined {
    return this.contentsSignal().find((content) => content.id === id);
  }
}
