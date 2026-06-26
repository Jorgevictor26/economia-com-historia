import { Component, inject } from '@angular/core';
import { UserRole } from '../../../../models/user.model';
import { AuthStateService } from '../../../../services/auth-state.service';
import { AdminConsoleShellComponent } from '../../components/admin-console-shell.component';
import { AdminPageHeaderComponent } from '../../shared/components';

interface ManagedUser {
  name: string;
  email: string;
  role: UserRole;
  department: string;
  position: string;
  status: 'Ativo' | 'Inativo' | 'Pendente';
  lastAccess: string;
}

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [AdminConsoleShellComponent, AdminPageHeaderComponent],
  templateUrl: './admin-users.page.html',
})
export class AdminUsersPage {
  readonly auth = inject(AuthStateService);

  readonly users: ManagedUser[] = [
    { name: 'Joao Domingos', email: 'joao@ech.edu', role: 'super-admin', department: 'Academico', position: 'Super admin', status: 'Ativo', lastAccess: 'Hoje, 09:42' },
    { name: 'Maria dos Santos', email: 'maria@ech.edu', role: 'writer', department: 'Marketing', position: 'Editor de conteudo', status: 'Ativo', lastAccess: 'Ontem, 15:20' },
    { name: 'Antonio Luvuala', email: 'antonio@ech.edu', role: 'admin', department: 'Financeiro', position: 'Gestor financeiro', status: 'Inativo', lastAccess: '12 Out, 2023' },
    { name: 'Beatriz Neto', email: 'beatriz@ech.edu', role: 'student', department: 'Tecnologia', position: 'Analista de TI', status: 'Ativo', lastAccess: 'Ha 2 horas' },
  ];

  get adminCount(): number {
    return this.users.filter((user) => user.role === 'admin' || user.role === 'super-admin').length;
  }

  get superAdminCount(): number {
    return this.users.filter((user) => user.role === 'super-admin').length;
  }

  get pendingCount(): number {
    return this.users.filter((user) => user.status === 'Pendente').length;
  }

  roleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      student: 'Utilizador',
      writer: 'Escritor',
      moderator: 'Moderador',
      admin: 'Administrador',
      'super-admin': 'Super administrador',
    };

    return labels[role];
  }

  canPromoteToWriter(user: ManagedUser): boolean {
    return this.auth.canPromoteWriters() && user.role === 'student';
  }

  canPromoteToAdmin(user: ManagedUser): boolean {
    return this.auth.canPromoteAdmins() && ['student', 'writer', 'moderator'].includes(user.role);
  }

  promoteToWriter(user: ManagedUser): void {
    if (!this.canPromoteToWriter(user)) {
      return;
    }

    user.role = 'writer';
    user.position = 'Editor de conteudo';
    user.status = 'Ativo';
  }

  promoteToAdmin(user: ManagedUser): void {
    if (!this.canPromoteToAdmin(user)) {
      return;
    }

    user.role = 'admin';
    user.position = 'Administrador';
    user.status = 'Ativo';
  }

  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }
}
