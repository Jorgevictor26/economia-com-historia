import { Component } from '@angular/core';
import { AdminConsoleShellComponent } from '../../components/admin-console-shell.component';
import { AdminPageHeaderComponent } from '../../shared/components';

@Component({
  selector: 'app-admin-settings-page',
  standalone: true,
  imports: [AdminConsoleShellComponent, AdminPageHeaderComponent],
  templateUrl: './admin-settings.page.html',
})
export class AdminSettingsPage {
  saveStatus = '';

  saveSettings(): void {
    this.saveStatus = 'Configurações guardadas no painel.';
  }
}

