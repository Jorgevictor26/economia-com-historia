import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStateService } from '../../../../services/auth-state.service';
import { AdminConsoleShellComponent } from '../../components/admin-console-shell.component';
import { AdminPageHeaderComponent } from '../../shared/components/admin-page-header.component';

@Component({
  selector: 'app-admin-contents-page',
  standalone: true,
  imports: [RouterLink, AdminConsoleShellComponent, AdminPageHeaderComponent],
  templateUrl: './admin-contents.page.html',
})
export class AdminContentsPage {
  readonly auth = inject(AuthStateService);
}
