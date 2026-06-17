import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-admin-editorial-section',
  templateUrl: './admin-editorial-section.component.html'
})
export class AdminEditorialSectionComponent {
  @Input({ required: true }) title = '';
  @Input() icon = '';
  @Input() bordered = false;
}
