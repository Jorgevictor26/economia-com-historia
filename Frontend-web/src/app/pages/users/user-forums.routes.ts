import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Routes } from '@angular/router';
import { Content } from '../../models/content.model';
import { AuthStateService } from '../../services/auth-state.service';
import { authGuard } from '../../services/auth.guard';
import { ContentService } from '../../services/content.service';
import { BackendForum, ForumService } from '../../services/forum.service';
import { ToastService } from '../../services/toast.service';
import { BackToTopComponent } from '../shared/back-to-top/back-to-top.component';
import { PublicNavbarComponent } from '../shared/public-navbar/public-navbar.component';

interface PageToast {
  message: string;
  kind: 'success' | 'error' | 'info';
}

@Component({
  selector: 'app-user-forums-page',
  standalone: true,
  imports: [RouterLink, PublicNavbarComponent, BackToTopComponent],
  templateUrl: './user-forums.page.html',
})
export class UserForumsPage {
  private readonly route = inject(ActivatedRoute);
  readonly auth = inject(AuthStateService);
  readonly contentService = inject(ContentService);
  readonly forumService = inject(ForumService);
  private readonly toastService = inject(ToastService);

  readonly categories = ['Economia', 'Hist\u00f3ria', 'Jindungo', 'Podcast'];
  readonly selectedCategory = signal(this.categories[0]);
  readonly privacy = signal<'public' | 'private'>('public');
  readonly protectedByPassword = signal(false);
  readonly inviteEmails = signal<string[]>([]);
  readonly selectedContentIds = signal<string[]>(['1', '2']);
  readonly showAllResources = signal(false);
  readonly createModalOpen = signal(false);
  readonly resourceError = signal(false);
  readonly toast = signal<PageToast | null>(null);
  readonly forumPage = signal(1);
  readonly forumPageSize = 8;
  private toastTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    void this.loadForums();
  }

  readonly selectedResources = computed(() =>
    this.contentService.contents().filter((content) => this.selectedContentIds().includes(content.id)),
  );

  readonly visibleResources = computed(() =>
    this.showAllResources() ? this.contentService.contents() : this.selectedResources(),
  );

  readonly forumTotalPages = computed(() => Math.max(1, Math.ceil(this.forumService.rooms().length / this.forumPageSize)));
  readonly pagedRooms = computed(() => {
    const start = (this.forumPage() - 1) * this.forumPageSize;

    return this.forumService.rooms().slice(start, start + this.forumPageSize);
  });
  readonly hasPreviousForumPage = computed(() => this.forumPage() > 1);
  readonly hasNextForumPage = computed(() => this.forumPage() < this.forumTotalPages());

  ngOnInit(): void {
    const contentId = this.route.snapshot.queryParamMap.get('content');

    if (!contentId) {
      return;
    }

    this.selectedContentIds.set([contentId]);
    this.showAllResources.set(false);

    if (this.auth.isAuthenticated()) {
      this.createModalOpen.set(true);
      return;
    }

    this.auth.requireLoginFor('criar discuss\u00e3o');
  }

  openCreateModal(): void {
    if (!this.auth.isAuthenticated()) {
      this.auth.requireLoginFor('criar discuss\u00e3o');
      return;
    }

    this.resourceError.set(false);
    this.createModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.createModalOpen.set(false);
  }

  setPrivacy(privacy: 'public' | 'private'): void {
    this.privacy.set(privacy);
  }

  toggleResource(contentId: string): void {
    this.selectedContentIds.update((ids) =>
      ids.includes(contentId) ? ids.filter((id) => id !== contentId) : [...ids, contentId],
    );
    this.resourceError.set(false);
  }

  addInvite(emailInput: HTMLInputElement): void {
    const email = emailInput.value.trim();

    if (!email) {
      return;
    }

    this.inviteEmails.update((emails) => (emails.includes(email) ? emails : [...emails, email]));
    emailInput.value = '';
  }

  removeInvite(email: string): void {
    this.inviteEmails.update((emails) => emails.filter((item) => item !== email));
  }

  async createDebateRoom(titleInput: HTMLInputElement, objectiveInput: HTMLTextAreaElement): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      this.auth.requireLoginFor('criar discuss\u00e3o');
      return;
    }

    const title = titleInput.value.trim();
    const objective = objectiveInput.value.trim();
    const linkedContents = this.selectedResources().map((content) => this.toLinkedContent(content));

    this.resourceError.set(!linkedContents.length);

    if (!title || !objective || !linkedContents.length) {
      this.showToast('Preencha o título, o objetivo e vincule pelo menos um conteúdo da plataforma.', 'error');
      return;
    }

    try {
      await this.forumService.create({
        name: title,
        description: objective,
        rules: objective,
        category: this.selectedCategory(),
        visibility: this.privacy(),
        content_permission: this.protectedByPassword() ? 'subscribers' : 'public',
        allow_attachments: false,
        content_ids: linkedContents.map((content) => content.id),
      });

      titleInput.value = '';
      objectiveInput.value = '';
      this.inviteEmails.set([]);
      this.selectedContentIds.set(['1', '2']);
      this.privacy.set('public');
      this.protectedByPassword.set(false);
      this.showAllResources.set(false);
      this.createModalOpen.set(false);
      this.showToast('Sala de debate enviada para aprovação.', 'success');
    } catch {
      this.showToast('Não foi possível criar a sala de debate.', 'error');
    }
  }

  private async loadForums(): Promise<void> {
    try {
      const forums = await this.forumService.getAll();

      if (forums.length > 0) {
        this.forumService.rooms.set(forums.map((forum) => this.toForumRoom(forum)));
        this.forumPage.set(1);
      }
    } catch {
      this.showToast('Não foi possível carregar os fóruns.', 'error');
    }
  }

  goToPreviousForumPage(): void {
    this.forumPage.update((page) => Math.max(1, page - 1));
  }

  goToNextForumPage(): void {
    this.forumPage.update((page) => Math.min(this.forumTotalPages(), page + 1));
  }

  private showToast(message: string, kind: PageToast['kind'] = 'info'): void {
    this.toastService[kind](message);
  }

  private toForumRoom(forum: BackendForum) {
    return {
      id: String(forum.id),
      name: forum.name,
      visibility: forum.visibility === 'private' ? 'private' as const : 'public' as const,
      members: 0,
      activeDebates: forum.topics_count ?? 0,
      description: forum.description ?? forum.rules ?? 'Sem descrição.',
      category: forum.category ?? 'Fórum',
      objective: forum.description ?? forum.rules ?? '',
      inviteEmails: [],
      protectedByPassword: forum.content_permission === 'subscribers',
      linkedContents: (forum.contents ?? []).map((content) => ({
        id: String(content.id),
        title: content.title,
        type: content.content_type?.name ?? 'Conteúdo',
        meta: content.category?.name ?? '',
      })),
    };
  }

  roomInitials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'EH';
  }

  private toLinkedContent(content: Content) {
    return {
      id: content.id,
      title: content.title,
      type: this.contentTypeLabel(content.type),
      meta: `${content.readingMinutes} min de leitura`,
    };
  }

  private contentTypeLabel(type: Content['type']): string {
    const labels: Record<Content['type'], string> = {
      historia: 'Artigo Acad\u00e9mico',
      economia: 'Artigo Acad\u00e9mico',
      podcast: 'Podcast',
      jindungo: 'Jindungo',
    };

    return labels[type];
  }
}

@Component({
  selector: 'app-user-forum-detail-page',
  standalone: true,
  imports: [RouterLink, PublicNavbarComponent, BackToTopComponent],
  templateUrl: './user-forum-detail.page.html',
})
export class UserForumDetailPage {
  private readonly route = inject(ActivatedRoute);
  readonly auth = inject(AuthStateService);
  readonly forumService = inject(ForumService);
  readonly likedByMe = signal(false);
  readonly commentComposerOpen = signal(false);
  readonly forumFeedback = signal('');

  readonly room = computed(() => {
    const roomId = this.route.snapshot.paramMap.get('id');

    return this.forumService.rooms().find((room) => room.id === roomId) ?? null;
  });

  readonly accessNotice = computed(() => {
    const room = this.room();

    if (!room || room.visibility !== 'private' || this.auth.canAccessForum(room.id, room.visibility)) {
      return '';
    }

    return 'Este f\u00f3rum \u00e9 privado. Precisa de convite ou palavra-passe para participar.';
  });

  roomInitials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'EH';
  }

  requireLogin(event: Event, operation: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.auth.requireLoginFor(operation);
  }

  likeForum(event: Event): void {
    if (!this.auth.isAuthenticated()) {
      this.requireLogin(event, 'gostar do f\u00f3rum');
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.likedByMe.update((liked) => !liked);
    this.forumFeedback.set('');
  }

  openCommentComposer(event: Event): void {
    if (!this.auth.isAuthenticated()) {
      this.requireLogin(event, 'comentar no f\u00f3rum');
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.commentComposerOpen.set(true);
    this.forumFeedback.set('');
  }

  async shareForum(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const room = this.room();
    const url = window.location.href.split('#')[0];
    const title = `${room?.name ?? 'F\u00f3rum'} - Economia com Hist\u00f3ria`;

    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => undefined);
      return;
    }

    await navigator.clipboard?.writeText(url);
    this.forumFeedback.set('Link do f\u00f3rum copiado.');
  }

  saveForum(event: Event): void {
    if (!this.auth.isAuthenticated()) {
      this.requireLogin(event, 'guardar f\u00f3rum');
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.forumFeedback.set('F\u00f3rum guardado.');
  }

  reportForum(event: Event): void {
    if (!this.auth.isAuthenticated()) {
      this.requireLogin(event, 'denunciar f\u00f3rum');
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.forumFeedback.set('Den\u00fancia enviada. A equipa vai rever.');
  }
}

export const USER_FORUMS_ROUTES: Routes = [
  { path: '', component: UserForumsPage },
  { path: ':id', canActivate: [authGuard], data: { loginOperation: 'ver detalhes do fórum' }, component: UserForumDetailPage },
];
