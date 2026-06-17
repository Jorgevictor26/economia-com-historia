import { Component, input } from '@angular/core';
import { DomainProgress } from '../../../../../models/profile.model';

@Component({
  selector: 'app-progress-domains',
  templateUrl: './progress-domains.component.html',
  styleUrl: './progress-domains.component.scss',
})
export class ProgressDomainsComponent {
  readonly domains = input.required<DomainProgress[]>();
}


