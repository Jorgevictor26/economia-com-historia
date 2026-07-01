import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info';

export interface AppToast {
  id: number;
  message: string;
  kind: ToastKind;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<AppToast[]>([]);
  private nextId = 1;
  private readonly duration = 5000;
  private readonly timeouts = new Map<number, ReturnType<typeof setTimeout>>();

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  dismiss(id: number): void {
    const timeout = this.timeouts.get(id);

    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(id);
    }

    this.toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  private show(message: string, kind: ToastKind): void {
    const normalizedMessage = message.trim();

    if (!normalizedMessage) {
      return;
    }

    const alreadyVisible = this.toasts().some((toast) => toast.kind === kind && toast.message === normalizedMessage);

    if (alreadyVisible) {
      return;
    }

    const id = this.nextId++;
    const toast: AppToast = { id, message: normalizedMessage, kind };

    this.toasts.update((toasts) => [...toasts, toast]);
    this.timeouts.set(id, setTimeout(() => this.dismiss(id), this.duration));
  }
}
