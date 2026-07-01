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
  private readonly toastService = inject(ToastService);
  promotionModalOpen = false;
  superAdminModalOpen = false;
  editingUser: ManagedUser | null = null;
  promotionSearchTerm = '';
  searchTerm = '';
  selectedRole = 'Todos os cargos';
  currentPage = 1;
  readonly pageSize = 4;

  readonly users: ManagedUser[] = [
    { name: 'João Domingos', email: 'joao@ech.edu', role: 'super-admin', position: 'Super admin', status: 'Ativo', lastAccess: 'Hoje, 09:42' },
    { name: 'Maria dos Santos', email: 'maria@ech.edu', role: 'writer', position: 'Editor de conteúdo', status: 'Ativo', lastAccess: 'Ontem, 15:20' },
    { name: 'António Luvuala', email: 'antonio@ech.edu', role: 'admin', position: 'Gestor financeiro', status: 'Inativo', lastAccess: '12 Out, 2023' },
    { name: 'Beatriz Neto', email: 'beatriz@ech.edu', role: 'student', position: 'Analista de TI', status: 'Ativo', lastAccess: 'Há 2 horas' },
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
    return this.users.some((user) => this.canPromoteToWriter(user) || this.canPromoteToAdmin(user));
  }

  get canCreateSuperAdmin(): boolean {
    return this.auth.isSuperAdmin();
  }

  get visibleUsers(): ManagedUser[] {
    return this.users.filter((user) => user.role !== 'super-admin');
  }

  get filteredUsers(): ManagedUser[] {
    const query = this.normalize(this.searchTerm);

    return this.visibleUsers.filter((user) => {
      const matchesSearch = !query || this.normalize(`${user.name} ${user.email}`).includes(query);
      const matchesRole = this.selectedRole === 'Todos os cargos' || this.roleLabel(user.role) === this.selectedRole || user.position === this.selectedRole;

      return matchesSearch && matchesRole;
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

  promotionCandidates(): ManagedUser[] {
    const query = this.normalize(this.promotionSearchTerm);

    return this.visibleUsers.filter((user) => {
      const isEligible = this.canPromoteToWriter(user) || this.canPromoteToAdmin(user);
      const matchesSearch = !query || this.normalize(`${user.name} ${user.email} ${user.position} ${this.roleLabel(user.role)}`).includes(query);

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

  openSuperAdminModal(): void {
    if (!this.canCreateSuperAdmin) {
      return;
    }

    this.superAdminModalOpen = true;
  }

  closeSuperAdminModal(): void {
    this.superAdminModalOpen = false;
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

  updateRole(event: Event): void {
    this.selectedRole = (event.target as HTMLSelectElement).value;
    this.currentPage = 1;
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

  createSuperAdmin(
    nameInput: HTMLInputElement,
    emailInput: HTMLInputElement,
    passwordInput: HTMLInputElement,
    confirmPasswordInput: HTMLInputElement,
  ): void {
    if (!this.canCreateSuperAdmin) {
      return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!name || !email || !password || !confirmPassword) {
      this.showToast('Preencha nome, e-mail, palavra-passe e confirmação.', 'error');
      return;
    }

    if (password.length < 8) {
      this.showToast('A palavra-passe deve ter pelo menos 8 caracteres.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      this.showToast('As palavras-passe não coincidem.', 'error');
      return;
    }

    if (this.users.some((item) => item.email.toLowerCase() === email)) {
      this.showToast('Já existe um utilizador com este e-mail.', 'error');
      return;
    }

    this.users
      .filter((item) => item.role === 'super-admin')
      .forEach((item) => {
        item.role = 'admin';
        item.position = 'Administrador';
        item.status = 'Ativo';
      });

    this.users.unshift({
      name,
      email,
      role: 'super-admin',
      position: 'Super admin',
      status: 'Ativo',
      lastAccess: 'Agora',
    });

    this.currentPage = 1;
    this.closeSuperAdminModal();
    this.showToast(`${name} foi criado como super administrador.`, 'success');
  }

  editUser(user: ManagedUser): void {
    this.editingUser = user;
  }

  saveEditedUser(
    nameInput: HTMLInputElement,
    emailInput: HTMLInputElement,
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
    this.editingUser.position = position;
    this.editingUser.status = statusInput.value as ManagedUser['status'];
    this.editingUser.role = roleInput.value as UserRole;
    this.closeEditModal();
    this.showToast('Membro atualizado com sucesso.', 'success');
  }

  deleteUser(user: ManagedUser): void {
    if (user.role === 'super-admin') {
      return;
    }

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

  private showToast(message: string, kind: 'success' | 'error' | 'info' = 'info'): void {
    this.toastService[kind](message);
  }
}
