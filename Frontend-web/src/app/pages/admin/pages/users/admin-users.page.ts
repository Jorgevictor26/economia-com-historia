import { Component, OnInit, inject } from '@angular/core';
import { UserRole } from '../../../../models/user.model';
import { AdminUserService, BackendManagedUser } from '../../../../services/admin-user.service';
import { AuthStateService } from '../../../../services/auth-state.service';
import { ToastService } from '../../../../services/toast.service';
import { AdminConsoleShellComponent } from '../../components/admin-console-shell.component';
import { AdminPageHeaderComponent } from '../../shared/components';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  category: string;
  status: 'Ativo' | 'Inativo' | 'Pendente';
  lastAccess: string;
}

interface UserMetric {
  label: string;
  value: string;
  change: string;
  icon: string;
  tone: 'orange' | 'purple' | 'green' | 'blue';
}

interface UserTab {
  label: string;
  count: number;
  roles?: UserRole[];
}

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [AdminConsoleShellComponent, AdminPageHeaderComponent],
  templateUrl: './admin-users.page.html',
})
export class AdminUsersPage implements OnInit {
  readonly auth = inject(AuthStateService);
  private readonly adminUsers = inject(AdminUserService);
  private readonly toastService = inject(ToastService);

  promotionModalOpen = false;
  superAdminModalOpen = false;
  promotionSearchTerm = '';
  searchTerm = '';
  activeTab = 'Todos';
  currentPage = 1;
  readonly pageSize = 4;
  users: ManagedUser[] = [];
  isLoading = false;
  isSaving = false;
  loadError = '';

  ngOnInit(): void {
    void this.loadUsers();
  }

  get metrics(): UserMetric[] {
    const metrics: UserMetric[] = [
      { label: 'Total de users', value: String(this.visibleUsers.length), change: 'Utilizadores visíveis', icon: 'groups', tone: 'blue' },
      { label: 'Users', value: String(this.countByRoles(['student'])), change: 'Contas comuns', icon: 'person', tone: 'orange' },
      { label: 'Writers', value: String(this.countByRoles(['writer'])), change: 'Podem criar conteúdos', icon: 'edit_square', tone: 'green' },
    ];

    if (this.auth.isSuperAdmin()) {
      metrics.push({ label: 'Admins', value: String(this.countByRoles(['admin', 'super-admin'])), change: 'Gestão da plataforma', icon: 'admin_panel_settings', tone: 'purple' });
    }

    return metrics;
  }

  get canPromoteUsers(): boolean {
    return this.visibleUsers.some((user) => this.canPromoteToWriter(user) || this.canPromoteToAdmin(user) || this.canPromoteToSuperAdmin(user));
  }

  get canCreateSuperAdmin(): boolean {
    return this.auth.isSuperAdmin();
  }

  get visibleUsers(): ManagedUser[] {
    if (this.auth.isSuperAdmin()) {
      return this.users;
    }

    return this.users.filter((user) => user.role === 'student' || user.role === 'writer');
  }

  get tabs(): UserTab[] {
    const tabs: UserTab[] = [
      { label: 'Todos', count: this.visibleUsers.length },
      { label: 'Users', count: this.countByRoles(['student']), roles: ['student'] },
      { label: 'Writers', count: this.countByRoles(['writer']), roles: ['writer'] },
    ];

    if (this.auth.isSuperAdmin()) {
      tabs.push({ label: 'Admins', count: this.countByRoles(['admin', 'super-admin']), roles: ['admin', 'super-admin'] });
    }

    return tabs;
  }

  get filteredUsers(): ManagedUser[] {
    const query = this.normalize(this.searchTerm);

    return this.visibleUsers.filter((user) => {
      const activeTab = this.tabs.find((tab) => tab.label === this.activeTab);
      const matchesSearch = !query || this.normalize(`${user.name} ${user.email} ${user.category} ${this.roleLabel(user.role)}`).includes(query);
      const matchesTab = !activeTab?.roles || activeTab.roles.includes(user.role);

      return matchesSearch && matchesTab;
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

  async loadUsers(): Promise<void> {
    this.isLoading = true;
    this.loadError = '';

    try {
      const response = await this.adminUsers.getAll({ perPage: 100 });
      this.users = response.data.map((user) => this.toManagedUser(user));
      this.currentPage = 1;
    } catch (error) {
      this.loadError = this.errorMessage(error, 'Não foi possível carregar os utilizadores.');
      this.showToast(this.loadError, 'error');
    } finally {
      this.isLoading = false;
    }
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

  metricToneClasses(tone: UserMetric['tone']): string {
    const classes: Record<UserMetric['tone'], string> = {
      orange: 'bg-[#F2E6E9] text-[#8A3F50]',
      purple: 'bg-[#F2E6E9] text-[#8A3F50]',
      green: 'bg-[#E9F4F2] text-[#2A9D8F]',
      blue: 'bg-[#F5F5F5] text-[#616161]',
    };

    return classes[tone];
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

    return this.visibleUsers.filter((user) => {
      const isEligible = this.canPromoteToWriter(user) || this.canPromoteToAdmin(user) || this.canPromoteToSuperAdmin(user);
      const matchesSearch = !query || this.normalize(`${user.name} ${user.email} ${user.category} ${this.roleLabel(user.role)}`).includes(query);

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

  updatePromotionSearch(event: Event): void {
    this.promotionSearchTerm = (event.target as HTMLInputElement).value;
  }

  updateSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.currentPage = 1;
  }

  setActiveTab(tab: UserTab): void {
    this.activeTab = tab.label;
    this.currentPage = 1;
  }

  previousPage(): void {
    this.currentPage = Math.max(1, this.currentPage - 1);
  }

  nextPage(): void {
    this.currentPage = Math.min(this.totalPages, this.currentPage + 1);
  }

  async promoteToWriter(user: ManagedUser): Promise<void> {
    if (!this.canPromoteToWriter(user) || this.isSaving) {
      return;
    }

    await this.promote(user, () => this.adminUsers.promoteToWriter(user.id), `${user.name} foi promovido a escritor.`);
  }

  async promoteToAdmin(user: ManagedUser): Promise<void> {
    if (!this.canPromoteToAdmin(user) || this.isSaving) {
      return;
    }

    await this.promote(user, () => this.adminUsers.promoteToAdmin(user.id), `${user.name} foi promovido a administrador.`);
  }

  async promoteToSuperAdmin(user: ManagedUser): Promise<void> {
    if (!this.canPromoteToSuperAdmin(user) || this.isSaving) {
      return;
    }

    await this.promote(user, () => this.adminUsers.promoteToSuperAdmin(user.id), `${user.name} agora é super administrador.`);
  }

  async createSuperAdmin(
    nameInput: HTMLInputElement,
    emailInput: HTMLInputElement,
    passwordInput: HTMLInputElement,
    confirmPasswordInput: HTMLInputElement,
  ): Promise<void> {
    if (!this.canCreateSuperAdmin || this.isSaving) {
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

    this.isSaving = true;

    try {
      await this.adminUsers.createSuperAdmin({
        name,
        email,
        password,
        password_confirmation: confirmPassword,
        status: 'active',
      });
      await this.loadUsers();
      this.closeSuperAdminModal();
      this.showToast(`${name} foi criado como super administrador.`, 'success');
    } catch (error) {
      this.showToast(this.errorMessage(error, 'Não foi possível criar o super administrador.'), 'error');
    } finally {
      this.isSaving = false;
    }
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

  private async promote(user: ManagedUser, action: () => Promise<BackendManagedUser>, message: string): Promise<void> {
    this.isSaving = true;

    try {
      const updated = await action();
      const mapped = this.toManagedUser(updated);
      this.users = this.users.map((item) => item.id === mapped.id ? mapped : item);
      await this.loadUsers();
      this.closePromotionModal();
      this.showToast(message, 'success');
    } catch (error) {
      this.showToast(this.errorMessage(error, 'Não foi possível promover o utilizador.'), 'error');
    } finally {
      this.isSaving = false;
    }
  }

  private toManagedUser(user: BackendManagedUser): ManagedUser {
    const role = this.resolveRole(user.roles);

    return {
      id: String(user.id),
      name: user.name,
      email: user.email,
      role,
      category: this.userCategory(role),
      status: this.toStatus(user.status),
      lastAccess: this.formatDate(user.updated_at ?? user.created_at),
    };
  }

  private resolveRole(roles: BackendManagedUser['roles'] = []): UserRole {
    const roleNames = roles.map((role) => role.name.toLowerCase());

    if (roleNames.includes('super-admin')) {
      return 'super-admin';
    }

    if (roleNames.includes('admin')) {
      return 'admin';
    }

    if (roleNames.includes('writer') || roleNames.includes('escritor')) {
      return 'writer';
    }

    if (roleNames.includes('moderator') || roleNames.includes('moderador')) {
      return 'moderator';
    }

    return 'student';
  }

  private countByRoles(roles: UserRole[]): number {
    return this.visibleUsers.filter((user) => roles.includes(user.role)).length;
  }

  private userCategory(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      student: 'User',
      writer: 'Writer',
      moderator: 'Moderador',
      admin: 'Admin',
      'super-admin': 'Super admin',
    };

    return labels[role];
  }

  private toStatus(status: string | null | undefined): ManagedUser['status'] {
    const normalized = this.normalize(status ?? 'active');

    if (normalized === 'pending' || normalized === 'pendente') {
      return 'Pendente';
    }

    if (normalized === 'inactive' || normalized === 'inativo') {
      return 'Inativo';
    }

    return 'Ativo';
  }

  private formatDate(value: string | null | undefined): string {
    const date = value ? new Date(value) : null;

    if (!date || Number.isNaN(date.getTime())) {
      return 'Sem registo';
    }

    return new Intl.DateTimeFormat('pt-AO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private errorMessage(error: unknown, fallback: string): string {
    const response = error as { error?: { message?: string; errors?: Record<string, string[]> }; message?: string };
    const validationErrors = response.error?.errors;

    if (validationErrors) {
      return Object.values(validationErrors).flat().join(' ');
    }

    return response.error?.message ?? response.message ?? fallback;
  }

  private showToast(message: string, kind: 'success' | 'error' | 'info' = 'info'): void {
    this.toastService[kind](message);
  }
}
