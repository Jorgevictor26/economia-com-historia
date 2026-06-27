import { Component, input } from '@angular/core';

@Component({
  selector: 'app-admin-page-header',
  standalone: true,
  template: `
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        @if (eyebrow()) {
          <p class="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#9E9E9E]">{{ eyebrow() }}</p>
        }
        <h1 class="font-display text-[30px] font-extrabold leading-tight text-[#8A3F50]">{{ title() }}</h1>
      </div>

      <ng-content />
    </header>
  `,
})
export class AdminPageHeaderComponent {
  readonly title = input.required<string>();
  readonly eyebrow = input<string>('');
}
