import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminConsoleShellComponent } from '../../components/admin-console-shell.component';

@Component({
  selector: 'app-admin-statistics-page',
  imports: [RouterLink, AdminConsoleShellComponent],
  templateUrl: './admin-statistics.page.html',
})
export class AdminStatisticsPage {}
