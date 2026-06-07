import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-admin-editorial-section',
  template: `
    <fieldset class="grid gap-5 px-6 py-5" [class.border-b]="bordered" [class.border-[#eee8ea]]="bordered">
      <legend class="flex items-center gap-2 font-display text-[17px] font-extrabold text-[#4b1b29]">
        <span class="text-[14px]" [innerHTML]="icon"></span>
        {{ title }}
      </legend>

      <ng-content />
    </fieldset>
  `,
})
export class AdminEditorialSectionComponent {
  @Input({ required: true }) title = '';
  @Input() icon = '';
  @Input() bordered = false;
}
