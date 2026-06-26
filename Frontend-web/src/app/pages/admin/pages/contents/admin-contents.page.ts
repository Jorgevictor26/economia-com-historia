import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStateService } from '../../../../services/auth-state.service';
import { AdminConsoleShellComponent } from '../../components/admin-console-shell.component';

@Component({
  selector: 'app-admin-contents-page',
  standalone: true,
  imports: [RouterLink, AdminConsoleShellComponent],
  templateUrl: './admin-contents.page.html',
})
export class AdminContentsPage {
  readonly auth = inject(AuthStateService);
}
