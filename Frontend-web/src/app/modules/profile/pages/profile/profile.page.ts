import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AcademicRankingComponent } from '../../components/academic-ranking/academic-ranking.component';
import { AchievementsComponent } from '../../components/achievements/achievements.component';
import { LearningProgressComponent } from '../../components/learning-progress/learning-progress.component';
import { ProfileHeaderComponent } from '../../components/profile-header/profile-header.component';
import { ProgressDomainsComponent } from '../../components/progress-domains/progress-domains.component';
import { StatisticsCardComponent } from '../../components/statistics-card/statistics-card.component';
import { ProfileService } from '../../services/profile.service';
import { AuthStateService } from '../../../../services/auth-state.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  active?: boolean;
}

interface ProfileSearchResult {
  label: string;
  detail: string;
  route: string;
}

@Component({
  selector: 'app-profile-page',
  imports: [
    RouterLink,
    ProfileHeaderComponent,
    AcademicRankingComponent,
    ProgressDomainsComponent,
    AchievementsComponent,
    LearningProgressComponent,
    StatisticsCardComponent,
  ],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
})
export class ProfilePage {
  private readonly profileService = inject(ProfileService);
  readonly auth = inject(AuthStateService);

  readonly sidebarOpen = signal(false);
  readonly notificationsOpen = signal(false);
  readonly searchTerm = signal('');
  readonly dashboard = signal(this.profileService.getDashboard());
  readonly accessLevel = computed(() => this.dashboard().user.accessLevel);
  readonly notifications = [
    { title: 'Novo quiz disponível', text: 'Teste os seus conhecimentos sobre economia monetária.', time: 'Agora' },
    { title: 'Fórum atualizado', text: 'Há novas respostas no debate sobre políticas fiscais.', time: '12 min' },
    { title: 'Progresso semanal', text: 'Concluiu 64% do módulo avançado.', time: 'Hoje' },
  ];

  readonly platformItems: MenuItem[] = [{ label: 'Painel Global', icon: 'dashboard', route: '/app/profile', active: true }];
  readonly administrationItems: MenuItem[] = [
    { label: 'Minha Aprendizagem', icon: 'school', route: '/app/contents' },
    { label: 'Conquistas', icon: 'military_tech', route: '/app/profile' },
    { label: 'Arquivos Históricos', icon: 'account_balance', route: '/app/contents' },
  ];
  readonly infrastructureItems: MenuItem[] = [{ label: 'Configurações', icon: 'settings', route: '/app/profile/edit' }];
  readonly searchResults = computed(() => {
    const query = this.normalizeText(this.searchTerm());
    const dashboard = this.dashboard();
    const results: ProfileSearchResult[] = [
      ...this.platformItems.map((item) => ({ label: item.label, detail: 'Área do perfil', route: item.route })),
      ...this.administrationItems.map((item) => ({ label: item.label, detail: 'Menu académico', route: item.route })),
      ...this.infrastructureItems.map((item) => ({ label: item.label, detail: 'Definições da conta', route: item.route })),
      { label: 'Ranking académico', detail: `${dashboard.ranking.points} pontos`, route: '/app/profile' },
      { label: 'Conquistas', detail: `${dashboard.achievements.filter((achievement) => achievement.unlocked).length} desbloqueadas`, route: '/app/profile' },
      { label: dashboard.learning.subtitle, detail: dashboard.learning.title, route: '/app/contents' },
    ];

    if (!query) {
      return [];
    }

    return results.filter((result) => this.normalizeText(`${result.label} ${result.detail}`).includes(query)).slice(0, 5);
  });

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  toggleNotifications(): void {
    this.notificationsOpen.update((open) => !open);
  }

  closeNotifications(): void {
    this.notificationsOpen.set(false);
  }

  updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
