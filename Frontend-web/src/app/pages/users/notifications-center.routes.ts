import { Component, OnInit, inject } from '@angular/core';
import { Routes } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications-center-page',
  templateUrl: './notifications-center.page.html'
})
export class NotificationsCenterPage implements OnInit {
  readonly notificationService = inject(NotificationService);

  ngOnInit(): void {
    void this.notificationService.loadNotifications();
  }
}

export const NOTIFICATIONS_CENTER_ROUTES: Routes = [{ path: '', component: NotificationsCenterPage }];
