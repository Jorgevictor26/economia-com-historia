import { Injectable, signal } from '@angular/core';
import { SubscriptionPlan } from '../models/subscription.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  readonly plans = signal<SubscriptionPlan[]>([
    {
      id: 'base',
      name: 'Academico',
      price: 0,
      interval: 'month',
      features: ['Conteudos abertos', 'Quizzes essenciais', 'Foruns publicos'],
    },
    {
      id: 'jindungo',
      name: 'Jindungo',
      price: 0,
      interval: 'month',
      highlighted: true,
      features: ['Textos com Jindungo', 'Salas por convite', 'Previews antecipados', 'Badges de subscritor'],
    },
  ]);
}
