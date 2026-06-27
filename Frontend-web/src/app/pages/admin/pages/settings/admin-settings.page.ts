import { Component } from '@angular/core';
import { AdminConsoleShellComponent } from '../../components/admin-console-shell.component';

@Component({
  selector: 'app-admin-settings-page',
  standalone: true,
  imports: [AdminConsoleShellComponent],
  templateUrl: './admin-settings.page.html',
})
export class AdminSettingsPage {}
