import { Injectable, signal } from '@angular/core';

interface ConfirmModel {
  id: string;
  title?: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private pendingResolve: ((value: boolean) => void) | null = null;
  private _current = signal<ConfirmModel | null>(null);

  readonly current = this._current.asReadonly();

  confirm(message: string, title?: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.pendingResolve = resolve;
      const id = String(Date.now());
      this._current.set({ id, title, message });
    });
  }

  resolve(value: boolean): void {
    if (this.pendingResolve) {
      this.pendingResolve(value);
      this.pendingResolve = null;
    }
    this._current.set(null);
  }
}
