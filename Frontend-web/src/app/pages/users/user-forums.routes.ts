import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, Routes } from '@angular/router';
import { Content } from '../../models/content.model';
import { AuthStateService } from '../../services/auth-state.service';
import { ContentService } from '../../services/content.service';
import { ForumService } from '../../services/forum.service';
import { BackToTopComponent } from '../shared/back-to-top/back-to-top.component';
import { PublicNavbarComponent } from '../shared/public-navbar/public-navbar.component';

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
  private readonly router = inject(Router);

  readonly categories = ['Economia', 'Hist\u00f3ria', 'Jindungo', 'Podcast'];
  readonly selectedCategory = signal(this.categories[0]);
  readonly privacy = signal<'public' | 'private'>('public');
  readonly protectedByPassword = signal(false);
  readonly inviteEmails = signal<string[]>([]);
  readonly selectedContentIds = signal<string[]>(['1', '2']);
  readonly showAllResources = signal(false);
  readonly createModalOpen = signal(false);
  readonly createFeedback = signal('');
  readonly resourceError = signal(false);

  readonly selectedResources = computed(() =>
    this.contentService.contents().filter((content) => this.selectedContentIds().includes(content.id)),
  );

  readonly visibleResources = computed(() =>
    this.showAllResources() ? this.contentService.contents() : this.selectedResources(),
  );

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

    this.createFeedback.set('');
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

  createDebateRoom(titleInput: HTMLInputElement, objectiveInput: HTMLTextAreaElement): void {
    if (!this.auth.isAuthenticated()) {
      this.auth.requireLoginFor('criar discuss\u00e3o');
      return;
    }

    const title = titleInput.value.trim();
    const objective = objectiveInput.value.trim();
    const linkedContents = this.selectedResources().map((content) => this.toLinkedContent(content));

    this.resourceError.set(!linkedContents.length);

    if (!title || !objective || !linkedContents.length) {
      this.createFeedback.set('Preencha o t\u00edtulo, o objetivo e vincule pelo menos um conte\u00fado da plataforma.');
      return;
    }

    const room = this.forumService.createRoom({
      name: title,
      category: this.selectedCategory(),
      objective,
      visibility: this.privacy(),
      inviteEmails: this.inviteEmails(),
      protectedByPassword: this.protectedByPassword(),
      linkedContents,
    });

    titleInput.value = '';
    objectiveInput.value = '';
    this.inviteEmails.set([]);
    this.selectedContentIds.set(['1', '2']);
    this.privacy.set('public');
    this.protectedByPassword.set(false);
    this.showAllResources.set(false);
    this.createFeedback.set('Discuss\u00e3o criada e vinculada aos conte\u00fados selecionados.');
    this.createModalOpen.set(false);
    void this.router.navigate(['/app/forums', room.id]);
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
  { path: ':id', component: UserForumDetailPage },
];
