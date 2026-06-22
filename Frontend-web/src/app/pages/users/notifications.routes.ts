import { Component, OnInit, inject } from '@angular/core';
import { Routes } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications-page',
  templateUrl: './notifications-page.html'
})
export class NotificationsPage implements OnInit {
  readonly notificationService = inject(NotificationService);

  ngOnInit(): void {
    void this.notificationService.loadNotifications();
  }
}

export const NOTIFICATIONS_ROUTES: Routes = [{ path: '', component: NotificationsPage }];
