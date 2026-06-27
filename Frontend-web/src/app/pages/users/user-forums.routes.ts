import { Component, computed, inject, signal } from '@angular/core';
import { Routes } from '@angular/router';
import { Content } from '../../models/content.model';
import { AuthStateService } from '../../services/auth-state.service';
import { ContentService } from '../../services/content.service';
import { ForumService } from '../../services/forum.service';
import { BackToTopComponent } from '../shared/back-to-top/back-to-top.component';
import { PublicFooterComponent } from '../shared/public-footer/public-footer.component';
import { PublicNavbarComponent } from '../shared/public-navbar/public-navbar.component';

@Component({
  selector: 'app-user-forums-page',
  standalone: true,
  imports: [PublicNavbarComponent, PublicFooterComponent, BackToTopComponent],
  templateUrl: './user-forums.page.html',
})
export class UserForumsPage {
  readonly auth = inject(AuthStateService);
  readonly contentService = inject(ContentService);
  readonly forumService = inject(ForumService);

  readonly categories = ['Economia', 'História', 'Jindungo', 'Podcast'];
  readonly selectedCategory = signal(this.categories[0]);
  readonly privacy = signal<'public' | 'private'>('public');
  readonly protectedByPassword = signal(false);
  readonly inviteEmails = signal<string[]>([]);
  readonly selectedContentIds = signal<string[]>(['1', '2']);
  readonly showAllResources = signal(false);
  readonly createFeedback = signal('');
  readonly resourceError = signal(false);

  readonly selectedResources = computed(() =>
    this.contentService.contents().filter((content) => this.selectedContentIds().includes(content.id)),
  );

  readonly visibleResources = computed(() =>
    this.showAllResources() ? this.contentService.contents() : this.selectedResources(),
  );

  requireLogin(event: Event, operation: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.auth.requireLoginFor(operation);
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
      this.auth.requireLoginFor('criar sala de debate');
      return;
    }

    const title = titleInput.value.trim();
    const objective = objectiveInput.value.trim();
    const linkedContents = this.selectedResources().map((content) => this.toLinkedContent(content));

    this.resourceError.set(!linkedContents.length);

    if (!title || !objective || !linkedContents.length) {
      this.createFeedback.set('Preencha o título, o objetivo e vincule pelo menos um conteúdo da plataforma.');
      return;
    }

    this.forumService.createRoom({
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
    this.createFeedback.set('Sala de debate criada e vinculada aos conteúdos selecionados.');
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
      historia: 'Artigo Académico',
      economia: 'Artigo Académico',
      podcast: 'Podcast',
      jindungo: 'Jindungo',
    };

    return labels[type];
  }
}

export const USER_FORUMS_ROUTES: Routes = [{ path: '', component: UserForumsPage }];
