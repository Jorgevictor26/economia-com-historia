import { Component } from '@angular/core';
import { AdminConsoleShellComponent } from '../../components/admin-console-shell.component';

@Component({
  selector: 'app-admin-users-page',
  imports: [AdminConsoleShellComponent],
  templateUrl: './admin-users.page.html',
})
export class AdminUsersPage {
  readonly users = [
    { name: 'Carlos Tchipia', email: 'carlos@ech.edu', role: 'Administrador', status: 'Ativo' },
    { name: 'Marta Silva', email: 'marta@ech.edu', role: 'Editor', status: 'Ativo' },
    { name: 'Rui Lopes', email: 'rui@ech.edu', role: 'Assinante', status: 'Pendente' },
    { name: 'Líria Bá', email: 'liria@ech.edu', role: 'Assinante', status: 'Ativo' },
  ];
}
