import { Injectable, signal } from '@angular/core';
import { SubscribedJindungoText, SubscriptionPlan } from '../models/subscription.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  readonly plans = signal<SubscriptionPlan[]>([
    {
      id: 'base',
      name: 'Academico',
      description: 'Acesso aberto aos conteudos publicos da plataforma.',
      features: ['Conteudos abertos', 'Quizzes essenciais', 'Foruns publicos'],
    },
    {
      id: 'jindungo',
      name: 'Jindungo',
      description: 'Subscreva como quem segue um canal: fica ligado aos textos Jindungo e desbloqueia recursos reservados.',
      highlighted: true,
      features: ['Textos com Jindungo', 'Salas por convite', 'Previews antecipados', 'Badge de subscritor'],
    },
  ]);

  readonly subscribedJindungoTexts = signal<SubscribedJindungoText[]>([
    {
      id: 'imposto-reservas',
      title: 'O Impacto das Reservas Internacionais no Kwanza',
      excerpt: 'Projecoes cambiais e leitura critica da balanca comercial angolana.',
      subscribedAt: '08 Out 2024',
      readingMinutes: 14,
      route: '/app/contents/imposto-reservas',
    },
    {
      id: 'diamantes-luanda-sul',
      title: 'Analise do Mercado de Diamantes na Lunda Sul',
      excerpt: 'Cadeia de valor, concessoes mineiras e impacto economico regional.',
      subscribedAt: '28 Set 2024',
      readingMinutes: 18,
      route: '/app/contents/diamantes-luanda-sul',
    },
    {
      id: 'politica-monetaria-angola',
      title: 'Analise da Politica Monetaria de Angola',
      excerpt: 'Taxas de juro, inflacao e mecanismos recentes de regulacao monetaria.',
      subscribedAt: '15 Set 2024',
      readingMinutes: 16,
      route: '/app/contents/politica-monetaria-angola',
    },
  ]);
}
