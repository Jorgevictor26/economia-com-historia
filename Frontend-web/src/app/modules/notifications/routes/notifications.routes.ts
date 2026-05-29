import { Component, inject } from '@angular/core';
import { Routes } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-notifications-page',
  template: `
    <section class="fluid-container-narrow rounded-lg bg-white py-8 shadow-sm">
      <h1 class="text-3xl font-extrabold text-bordeaux">Notificações</h1>
      @for (notification of notificationService.notifications(); track notification.id) {
        <article class="mt-4 border-t border-black/10 pt-4">
          <h2 class="font-bold text-bordeaux">{{ notification.title }}</h2>
          <p class="text-sm text-black/60">{{ notification.description }}</p>
        </article>
      }
    </section>
  `,
})
export class NotificationsPage {
  readonly notificationService = inject(NotificationService);
}

export const NOTIFICATIONS_ROUTES: Routes = [{ path: '', component: NotificationsPage }];
