import { Component, input } from '@angular/core';

@Component({
  selector: 'app-admin-metric-card',
  standalone: true,
  template: `
    <article class="rounded-[8px] border border-[#E0E0E0] bg-white p-5 shadow-[0_18px_45px_rgba(33,33,33,0.05)]">
      <span class="text-[9px] font-extrabold uppercase tracking-[0.04em] text-[#616161]">{{ label() }}</span>
      <strong class="font-number mt-2 block text-[23px] font-extrabold leading-none" [style.color]="accent()">
        {{ value() }}
      </strong>

      @if (note()) {
        <span class="mt-3 block text-[10px] font-extrabold text-[#7a6b12]">{{ note() }}</span>
      }

      @if (showProgress()) {
        <span class="mt-4 block h-0.5 w-full bg-[#E0E0E0]">
          <span class="block h-full" [style.width.%]="progress()" [style.background]="accent()"></span>
        </span>
      }
    </article>
  `,
})
export class AdminMetricCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly note = input<string>('');
  readonly accent = input<string>('#5C1E2F');
  readonly progress = input<number>(66);
  readonly showProgress = input<boolean>(false);
}
