import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [],
  template: `
    @if (toastService.toasts().length) {
      <section class="eh-toast-stack" aria-live="polite" aria-label="Feedbacks da aplicação">
        @for (toast of toastService.toasts(); track toast.id) {
          <aside class="eh-toast" [attr.data-kind]="toast.kind" role="status">
            <div class="eh-toast-content">
              <strong class="eh-toast-title">{{ toast.kind === 'error' ? 'Atenção' : toast.kind === 'success' ? 'Concluído' : 'Nota' }}</strong>
              <span class="eh-toast-message">{{ toast.message }}</span>
            </div>
            <span class="eh-toast-progress" aria-hidden="true"></span>
          </aside>
        }
      </section>
    }
  `,
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
}

