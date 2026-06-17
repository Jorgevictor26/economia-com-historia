import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminConsoleShellComponent } from '../../components/admin-console-shell.component';

@Component({
  selector: 'app-admin-contents-page',
  imports: [RouterLink, AdminConsoleShellComponent],
  templateUrl: './admin-contents.page.html',
})
export class AdminContentsPage {}
