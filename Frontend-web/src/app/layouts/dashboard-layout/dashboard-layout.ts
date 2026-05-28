import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './dashboard-layout.html',
})
export class DashboardLayoutComponent {
  readonly auth = inject(AuthStateService);
}
