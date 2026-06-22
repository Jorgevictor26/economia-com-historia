import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  read: boolean;
  createdAt?: string | null;
}

interface BackendNotification {
  id: number | string;
  title: string;
  message: string;
  is_read: boolean;
  created_at?: string | null;
}

interface NotificationResponse {
  data: BackendNotification;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  readonly notifications = signal<AppNotification[]>([]);
  readonly isLoading = signal(false);

  async loadNotifications(): Promise<void> {
    this.isLoading.set(true);

    try {
      const response = await firstValueFrom(this.http.get<BackendNotification[]>('/notifications'));
      this.notifications.set(response.map((notification) => this.toNotification(notification)));
    } finally {
      this.isLoading.set(false);
    }
  }

  async markAsRead(id: string): Promise<void> {
    const response = await firstValueFrom(this.http.patch<NotificationResponse>(`/notifications/${id}/read`, null));
    const updated = this.toNotification(response.data);

    this.notifications.update((notifications) =>
      notifications.map((notification) => (notification.id === updated.id ? updated : notification)),
    );
  }

  async markAllAsRead(): Promise<void> {
    const unreadNotifications = this.notifications().filter((notification) => !notification.read);

    await Promise.all(unreadNotifications.map((notification) => this.markAsRead(notification.id)));
  }

  clearNotifications(): void {
    this.notifications.set([]);
  }

  private toNotification(notification: BackendNotification): AppNotification {
    return {
      id: String(notification.id),
      title: notification.title,
      description: notification.message,
      read: Boolean(notification.is_read),
      createdAt: notification.created_at,
    };
  }
}
