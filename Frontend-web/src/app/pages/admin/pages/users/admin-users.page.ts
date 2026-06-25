import { Component, inject } from '@angular/core';
import { AuthStateService } from '../../../../services/auth-state.service';
import { AdminConsoleShellComponent } from '../../components/admin-console-shell.component';

@Component({
  selector: 'app-admin-users-page',
  imports: [AdminConsoleShellComponent],
  templateUrl: './admin-users.page.html',
})
export class AdminUsersPage {
  readonly auth = inject(AuthStateService);

  readonly users = [
    { name: 'Carlos Tchipia', email: 'carlos@ech.edu', role: 'Administrador', status: 'Ativo' },
    { name: 'Marta Silva', email: 'marta@ech.edu', role: 'Editor', status: 'Ativo' },
    { name: 'Rui Lopes', email: 'rui@ech.edu', role: 'Assinante', status: 'Pendente' },
    { name: 'Líria Bá', email: 'liria@ech.edu', role: 'Assinante', status: 'Ativo' },
  ];
}
