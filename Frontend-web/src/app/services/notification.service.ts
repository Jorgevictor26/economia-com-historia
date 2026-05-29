import { Injectable, signal } from '@angular/core';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  read: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly notifications = signal<AppNotification[]>([
    {
      id: '1',
      title: 'Novo quiz disponível',
      description: 'Mercados e História já pode ser jogado.',
      read: false,
    },
  ]);

  markAllAsRead(): void {
    this.notifications.update((notifications) => notifications.map((notification) => ({ ...notification, read: true })));
  }

  clearNotifications(): void {
    this.notifications.set([]);
  }
}
