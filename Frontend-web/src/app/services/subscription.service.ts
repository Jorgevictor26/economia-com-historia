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

  readonly subscribedJindungoTexts = signal<SubscribedJindungoText[]>([]);

  readonly jindungoTextCatalog = signal<SubscribedJindungoText[]>([]);

  readonly jindungoSubscriptionRequests = signal<JindungoSubscriptionRequest[]>([]);

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
