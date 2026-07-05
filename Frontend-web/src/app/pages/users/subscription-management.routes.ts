import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink, Routes } from '@angular/router';
import { SubscribedJindungoText } from '../../models/subscription.model';
import { AuthStateService } from '../../services/auth-state.service';
import { BackendContent, ContentService } from '../../services/content.service';
import { normalizeMediaUrl } from '../../services/media-url.util';
import { SubscriptionService } from '../../services/subscription.service';
import { BackToTopComponent } from '../shared/back-to-top/back-to-top.component';
import { PublicNavbarComponent } from '../shared/public-navbar/public-navbar.component';

@Component({
  selector: 'app-subscription-management-page',
  imports: [RouterLink, PublicNavbarComponent, BackToTopComponent],
  templateUrl: './subscription-management.page.html',
  styleUrl: './profile/profile.page.scss',
})
export class SubscriptionManagementPage implements OnInit {
  readonly subscriptionService = inject(SubscriptionService);
  private readonly contentService = inject(ContentService);
  readonly auth = inject(AuthStateService);
  readonly jindungoTexts = signal<SubscribedJindungoText[]>([]);
  readonly pendingSubscriptionIds = signal<string[]>([]);
  readonly isLoadingTexts = signal(false);
  readonly textLoadError = signal('');

  readonly profileMenu = [
    { label: 'Perfil', icon: 'person', route: '/app/profile', active: false },
    { label: 'Histórico', icon: 'history', route: '/app/profile/history', active: false },
    { label: 'Segurança da conta', icon: 'lock', route: '/app/profile/security', active: false },
    ...(this.auth.isSuperAdmin()
      ? []
      : [{ label: 'Subscrições', icon: 'workspace_premium', route: '/app/subscriptions', active: true }]),
    ...(this.auth.canWriteContent()
      ? [{ label: this.auth.canManagePlatform() ? 'Administração' : 'Console editorial', icon: 'admin_panel_settings', route: '/admin', active: false }]
      : []),
    { label: 'Suporte', icon: 'help_outline', route: '/app/profile/support', active: false },
  ];

  readonly subscribedTextKeys = computed(() => {
    const keys = new Set<string>();

    for (const text of this.subscriptionService.subscribedJindungoTexts()) {
      keys.add(String(text.id));
      keys.add(this.normalize(text.title));
    }

    return keys;
  });
  readonly availableJindungoTexts = computed(() =>
    this.jindungoTexts().map((text) => ({
      ...text,
      status: this.isSubscribedText(text)
        ? 'subscribed' as const
        : this.pendingSubscriptionIds().includes(text.id)
          ? 'pending' as const
          : 'available' as const,
    })),
  );
  readonly requestableJindungoTexts = computed(() =>
    this.availableJindungoTexts().filter((text) => text.status !== 'subscribed'),
  );
  readonly activeSubscribedTexts = computed(() => {
    const textsByKey = new Map<string, SubscribedJindungoText>();

    for (const text of this.subscriptionService.subscribedJindungoTexts()) {
      textsByKey.set(this.normalize(text.title), text);
    }

    for (const text of this.availableJindungoTexts()) {
      if (text.status === 'subscribed') {
        textsByKey.set(this.normalize(text.title), text);
      }
    }

    return Array.from(textsByKey.values());
  });
  readonly pendingRequests = computed(() =>
    this.subscriptionService.jindungoSubscriptionRequests().filter((request) => request.status === 'pending'),
  );
  readonly reviewedRequests = computed(() =>
    this.subscriptionService.jindungoSubscriptionRequests().filter((request) => request.status !== 'pending'),
  );

  ngOnInit(): void {
    void this.loadJindungoTexts();
  }

  subscribeToJindungo(): void {
    this.auth.subscribeToJindungo();
  }

  async subscribeToText(text: SubscribedJindungoText): Promise<void> {
    if (this.isSubscribedText(text) || this.pendingSubscriptionIds().includes(text.id)) {
      return;
    }

    try {
      const user = this.auth.user();
      this.subscriptionService.requestTextSubscription(
        text,
        user?.name ?? 'Utilizador',
        user?.email ?? 'utilizador@economiahistoria.ao',
      );
      this.pendingSubscriptionIds.update((ids) => ids.includes(text.id) ? ids : [...ids, text.id]);
    } catch {
      this.textLoadError.set('Não foi possível enviar o pedido de subscrição.');
    }
  }

  approveRequest(id: string): void {
    this.subscriptionService.approveRequest(id);
  }

  rejectRequest(id: string): void {
    this.subscriptionService.rejectRequest(id);
  }

  onSidebarPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const currentUser = this.auth.user();

    if (!file || !currentUser) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.auth.updateAuthenticatedUser({
        ...currentUser,
        avatarUrl: String(reader.result || ''),
      });
    };
    reader.readAsDataURL(file);
  }

  initials(): string {
    return this.profileName()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name[0])
      .join('')
      .toUpperCase();
  }

  profileName(): string {
    return this.auth.user()?.name || 'Estudante Angola';
  }

  profileAccessLevel(): string {
    const role = this.auth.user()?.role;

    switch (role) {
      case 'super-admin':
        return 'Super admin';
      case 'admin':
        return 'Admin';
      case 'writer':
        return 'Escritor';
      case 'moderator':
        return 'Moderador';
      default:
        return 'Utilizador comum';
    }
  }

  profileAvatarUrl(): string {
    return this.auth.user()?.avatarUrl ?? '';
  }

  private async loadJindungoTexts(): Promise<void> {
    this.isLoadingTexts.set(true);
    this.textLoadError.set('');

    try {
      const response = await this.contentService.getAll({ perPage: 60 });
      const texts = response.data.filter((content) => this.isJindungoContent(content));

      this.jindungoTexts.set(texts.length ? texts.map((content) => this.toJindungoText(content)) : this.subscriptionService.jindungoTextCatalog());
    } catch {
      this.jindungoTexts.set(this.subscriptionService.jindungoTextCatalog());
      this.textLoadError.set('Não foi possível carregar todos os textos Jindungo agora.');
    } finally {
      this.isLoadingTexts.set(false);
    }
  }

  private toJindungoText(content: BackendContent): SubscribedJindungoText {
    return {
      id: String(content.id),
      title: content.title,
      excerpt: content.summary || this.toPlainText(content.content) || 'Texto Jindungo disponível para subscrição.',
      subscribedAt: 'Ativo',
      readingMinutes: this.estimateReadingMinutes(content.content || content.summary || ''),
      route: `/app/contents/${content.id}`,
      imageUrl: normalizeMediaUrl(content.image_url, { contentId: content.id, mediaType: 'image' }) ?? '/assets/bna-hero.jpg',
      author: content.author?.name ?? content.user?.name ?? 'Equipa editorial',
    };
  }

  private isJindungoContent(content: BackendContent): boolean {
    return [
      content.content_type?.slug,
      content.content_type?.name,
      content.category?.slug,
      content.category?.name,
      content.title,
    ]
      .filter(Boolean)
      .some((value) => this.normalize(String(value)).includes('jindungo'));
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private isSubscribedText(text: SubscribedJindungoText): boolean {
    const keys = this.subscribedTextKeys();

    return keys.has(String(text.id)) || keys.has(this.normalize(text.title));
  }

  private toPlainText(value: string | null | undefined): string {
    return (value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private estimateReadingMinutes(value: string): number {
    const words = this.toPlainText(value).split(/\s+/).filter(Boolean).length;

    return Math.max(6, Math.ceil(words / 180));
  }
}

export const SUBSCRIPTION_MANAGEMENT_ROUTES: Routes = [{ path: '', component: SubscriptionManagementPage }];
