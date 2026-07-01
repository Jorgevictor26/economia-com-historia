import { Component, inject } from '@angular/core';
import { UserRole } from '../../../../models/user.model';
import { AuthStateService } from '../../../../services/auth-state.service';
import { ToastService } from '../../../../services/toast.service';
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

interface AdminToast {
  message: string;
  kind: 'success' | 'error' | 'info';
}

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [AdminConsoleShellComponent, AdminPageHeaderComponent],
  templateUrl: './admin-users.page.html',
})
export class AdminUsersPage {
  readonly auth = inject(AuthStateService);
  private readonly toastService = inject(ToastService);
  promotionModalOpen = false;
  editingUser: ManagedUser | null = null;
  promotionSearchTerm = '';
  searchTerm = '';
  selectedDepartment = 'Todos os departamentos';
  selectedRole = 'Todos os cargos';
  currentPage = 1;
  readonly pageSize = 4;
  toast: AdminToast | null = null;
  private toastTimeout?: ReturnType<typeof setTimeout>;

  readonly users: ManagedUser[] = [
    { name: 'Joao Domingos', email: 'joao@ech.edu', role: 'super-admin', department: 'Académico', position: 'Super admin', status: 'Ativo', lastAccess: 'Hoje, 09:42' },
    { name: 'Maria dos Santos', email: 'maria@ech.edu', role: 'writer', department: 'Marketing', position: 'Editor de conteúdo', status: 'Ativo', lastAccess: 'Ontem, 15:20' },
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

  get canPromoteUsers(): boolean {
    return this.users.some((user) => this.canPromoteToWriter(user) || this.canPromoteToAdmin(user) || this.canPromoteToSuperAdmin(user));
  }

  get filteredUsers(): ManagedUser[] {
    const query = this.normalize(this.searchTerm);

    return this.users.filter((user) => {
      const matchesSearch = !query || this.normalize(`${user.name} ${user.email}`).includes(query);
      const matchesDepartment = this.selectedDepartment === 'Todos os departamentos' || user.department === this.selectedDepartment;
      const matchesRole = this.selectedRole === 'Todos os cargos' || this.roleLabel(user.role) === this.selectedRole || user.position === this.selectedRole;

      return matchesSearch && matchesDepartment && matchesRole;
    });
  }

  get pagedUsers(): ManagedUser[] {
    const start = (this.currentPage - 1) * this.pageSize;

    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredUsers.length / this.pageSize));
  }

  get pageStart(): number {
    return this.filteredUsers.length ? (this.currentPage - 1) * this.pageSize + 1 : 0;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredUsers.length);
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
    return ['admin', 'super-admin'].includes(this.auth.user()?.role ?? 'student') && user.role === 'student';
  }

  canPromoteToAdmin(user: ManagedUser): boolean {
    return this.auth.isSuperAdmin() && ['student', 'writer', 'moderator'].includes(user.role);
  }

  canPromoteToSuperAdmin(user: ManagedUser): boolean {
    return this.auth.isSuperAdmin() && user.role !== 'super-admin';
  }

  promotionCandidates(): ManagedUser[] {
    const query = this.normalize(this.promotionSearchTerm);

    return this.users.filter((user) => {
      const isEligible = this.canPromoteToWriter(user) || this.canPromoteToAdmin(user) || this.canPromoteToSuperAdmin(user);
      const matchesSearch = !query || this.normalize(`${user.name} ${user.email} ${user.department} ${this.roleLabel(user.role)}`).includes(query);

      return isEligible && matchesSearch;
    });
  }

  openPromotionModal(): void {
    this.promotionSearchTerm = '';
    this.promotionModalOpen = true;
  }

  closePromotionModal(): void {
    this.promotionModalOpen = false;
  }

  closeEditModal(): void {
    this.editingUser = null;
  }

  updatePromotionSearch(event: Event): void {
    this.promotionSearchTerm = (event.target as HTMLInputElement).value;
  }

  updateSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.currentPage = 1;
  }

  updateDepartment(event: Event): void {
    this.selectedDepartment = (event.target as HTMLSelectElement).value;
    this.currentPage = 1;
  }

  updateRole(event: Event): void {
    this.selectedRole = (event.target as HTMLSelectElement).value;
    this.currentPage = 1;
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.showToast(`${this.filteredUsers.length} membro(s) encontrados.`, 'info');
  }

  previousPage(): void {
    this.currentPage = Math.max(1, this.currentPage - 1);
  }

  nextPage(): void {
    this.currentPage = Math.min(this.totalPages, this.currentPage + 1);
  }

  promoteToWriter(user: ManagedUser): void {
    if (!this.canPromoteToWriter(user)) {
      return;
    }

    user.role = 'writer';
    user.position = 'Editor de conteúdo';
    user.status = 'Ativo';
    this.closePromotionModal();
    this.showToast(`${user.name} foi promovido a escritor.`, 'success');
  }

  promoteToAdmin(user: ManagedUser): void {
    if (!this.canPromoteToAdmin(user)) {
      return;
    }

    user.role = 'admin';
    user.position = 'Administrador';
    user.status = 'Ativo';
    this.closePromotionModal();
    this.showToast(`${user.name} foi promovido a administrador.`, 'success');
  }

  promoteToSuperAdmin(user: ManagedUser): void {
    if (!this.canPromoteToSuperAdmin(user)) {
      return;
    }

    this.users
      .filter((item) => item.role === 'super-admin')
      .forEach((item) => {
        item.role = 'admin';
        item.position = 'Administrador';
        item.status = 'Ativo';
      });

    user.role = 'super-admin';
    user.position = 'Super admin';
    user.status = 'Ativo';
    this.closePromotionModal();
    this.showToast(`${user.name} foi promovido a super administrador.`, 'success');
  }

  editUser(user: ManagedUser): void {
    this.editingUser = user;
  }

  saveEditedUser(
    nameInput: HTMLInputElement,
    emailInput: HTMLInputElement,
    departmentInput: HTMLSelectElement,
    positionInput: HTMLInputElement,
    statusInput: HTMLSelectElement,
    roleInput: HTMLSelectElement,
  ): void {
    if (!this.editingUser) {
      return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const position = positionInput.value.trim();

    if (!name || !email || !position) {
      this.showToast('Preencha nome, e-mail e cargo antes de guardar.', 'error');
      return;
    }

    this.editingUser.name = name;
    this.editingUser.email = email;
    this.editingUser.department = departmentInput.value;
    this.editingUser.position = position;
    this.editingUser.status = statusInput.value as ManagedUser['status'];
    this.editingUser.role = roleInput.value as UserRole;
    this.closeEditModal();
    this.showToast('Membro atualizado com sucesso.', 'success');
  }

  deleteUser(user: ManagedUser): void {
    const index = this.users.findIndex((item) => item.email === user.email);

    if (index < 0) {
      return;
    }

    this.users.splice(index, 1);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    this.showToast(`${user.name} foi removido da lista.`, 'success');
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

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private showToast(message: string, kind: AdminToast['kind'] = 'info'): void {
    this.toastService[kind](message);
  }
}
