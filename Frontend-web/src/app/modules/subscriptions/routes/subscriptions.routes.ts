import { Component, inject } from '@angular/core';
import { Routes } from '@angular/router';
import { SubscriptionService } from '../../../services/subscription.service';
import { AuthStateService } from '../../../services/auth-state.service';

@Component({
  selector: 'app-subscriptions-page',
  template: `
    <section class="fluid-container">
      <h1 class="text-3xl font-extrabold text-bordeaux">Subscrições</h1>
      <div class="mt-6 grid gap-4 md:grid-cols-2 2xl:gap-8">
        @for (plan of subscriptionService.plans(); track plan.id) {
          <article class="rounded-lg bg-white p-6 shadow-sm" [class.ring-2]="plan.highlighted" [class.ring-gold]="plan.highlighted">
            <h2 class="text-xl font-bold text-bordeaux">{{ plan.name }}</h2>
            <p class="mt-2 text-3xl font-extrabold">{{ plan.price }} Kz</p>
            @if (plan.id === 'jindungo') {
              <button type="button" class="mt-5 h-10 rounded-md bg-bordeaux px-5 text-xs font-bold text-white" (click)="subscribeToJindungo()">
                {{ auth.hasPremiumAccess() ? 'Subscrito' : 'Subscrever gratuitamente' }}
              </button>
            }
          </article>
        }
      </div>
    </section>
  `,
})
export class SubscriptionsPage {
  readonly subscriptionService = inject(SubscriptionService);
  readonly auth = inject(AuthStateService);

  subscribeToJindungo(): void {
    this.auth.subscribeToJindungo();
  }
}

export const SUBSCRIPTIONS_ROUTES: Routes = [{ path: '', component: SubscriptionsPage }];
