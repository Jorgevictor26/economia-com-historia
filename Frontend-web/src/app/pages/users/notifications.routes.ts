import { Component, inject } from '@angular/core';
import { Routes } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications-page',
  templateUrl: './notifications-page.html'
})
export class NotificationsPage {
  readonly notificationService = inject(NotificationService);
}

export const NOTIFICATIONS_ROUTES: Routes = [{ path: '', component: NotificationsPage }];

