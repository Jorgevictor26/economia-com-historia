import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminConsoleShellComponent } from '../../components/admin-console-shell.component';
import { AdminPageHeaderComponent } from '../../shared/components';

@Component({
  selector: 'app-admin-statistics-page',
  standalone: true,
  imports: [RouterLink, AdminConsoleShellComponent, AdminPageHeaderComponent],
  templateUrl: './admin-statistics.page.html',
})
export class AdminStatisticsPage {}
