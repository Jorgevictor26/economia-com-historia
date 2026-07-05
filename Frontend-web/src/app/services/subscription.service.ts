import { Injectable, signal } from '@angular/core';
import { JindungoSubscriptionRequest, SubscribedJindungoText, SubscriptionPlan } from '../models/subscription.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  readonly plans = signal<SubscriptionPlan[]>([
    {
      id: 'base',
      name: 'Académico',
      description: 'Acesso aberto aos conteúdos públicos da plataforma.',
      features: ['Conteúdos abertos', 'Quizzes essenciais', 'Fóruns públicos'],
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
      title: 'Análise do Mercado de Diamantes na Lunda Sul',
      excerpt: 'Cadeia de valor, concessoes mineiras e impacto economico regional.',
      subscribedAt: '28 Set 2024',
      readingMinutes: 18,
      route: '/app/contents/diamantes-luanda-sul',
    },
    {
      id: 'politica-monetaria-angola',
      title: 'Análise da Política Monetaria de Angola',
      excerpt: 'Taxas de juro, inflacao e mecanismos recentes de regulacao monetaria.',
      subscribedAt: '15 Set 2024',
      readingMinutes: 16,
      route: '/app/contents/politica-monetaria-angola',
    },
  ]);

  readonly jindungoTextCatalog = signal<SubscribedJindungoText[]>([
    ...this.subscribedJindungoTexts(),
    {
      id: 'petroleo-divida-publica',
      title: 'Petróleo, Dívida Pública e o Orçamento Geral do Estado',
      excerpt: 'Uma leitura sobre receitas petrolíferas, despesa pública e escolhas fiscais em Angola.',
      subscribedAt: '',
      readingMinutes: 13,
      route: '/app/contents/petroleo-divida-publica',
    },
    {
      id: 'inflacao-cesta-basica',
      title: 'Inflação e Cesta Básica nas Famílias Angolanas',
      excerpt: 'Como a variação de preços altera consumo, poupança e prioridades domésticas.',
      subscribedAt: '',
      readingMinutes: 11,
      route: '/app/contents/inflacao-cesta-basica',
    },
  ]);

  readonly jindungoSubscriptionRequests = signal<JindungoSubscriptionRequest[]>([
    {
      id: 'req-1',
      userName: 'Estudante Angola',
      email: 'estudante@economiahistoria.ao',
      textTitle: 'O Impacto das Reservas Internacionais no Kwanza',
      requestedAt: 'Hoje, 09:40',
      status: 'pending',
    },
    {
      id: 'req-2',
      userName: 'Leitora Académica',
      email: 'leitora@economiahistoria.ao',
      textTitle: 'Análise da Política Monetaria de Angola',
      requestedAt: 'Ontem, 16:15',
      status: 'pending',
    },
    {
      id: 'req-3',
      userName: 'Investigador Luanda',
      email: 'investigador@economiahistoria.ao',
      textTitle: 'Análise do Mercado de Diamantes na Lunda Sul',
      requestedAt: '26 Jun 2026',
      status: 'approved',
    },
  ]);

  requestTextSubscription(text: SubscribedJindungoText, userName: string, email: string): void {
    const exists = this.jindungoSubscriptionRequests().some((request) =>
      request.email.toLowerCase() === email.toLowerCase()
      && request.textTitle === text.title
      && request.status === 'pending',
    );

    if (exists) {
      return;
    }

    this.jindungoSubscriptionRequests.update((requests) => [
      {
        id: `req-${text.id}-${Date.now()}`,
        userName,
        email,
        textTitle: text.title,
        requestedAt: 'Agora',
        status: 'pending',
      },
      ...requests,
    ]);
  }

  approveRequest(id: string): void {
    this.jindungoSubscriptionRequests.update((requests) =>
      requests.map((request) => request.id === id ? { ...request, status: 'approved' } : request),
    );
  }

  rejectRequest(id: string): void {
    this.jindungoSubscriptionRequests.update((requests) =>
      requests.map((request) => request.id === id ? { ...request, status: 'rejected' } : request),
    );
  }
}

