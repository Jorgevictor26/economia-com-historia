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
      title: 'Novo quiz disponivel',
      description: 'Mercados e Historia ja pode ser jogado.',
      read: false,
    },
  ]);
}
