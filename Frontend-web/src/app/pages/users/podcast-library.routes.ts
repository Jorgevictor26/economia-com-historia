import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Routes } from '@angular/router';
import { BackToTopComponent } from '../shared/back-to-top/back-to-top.component';
import { PublicFooterComponent } from '../shared/public-footer/public-footer.component';
import { PublicNavbarComponent } from '../shared/public-navbar/public-navbar.component';

@Component({
  selector: 'app-podcast-library-page',
  imports: [RouterLink, PublicNavbarComponent, PublicFooterComponent, BackToTopComponent],
  templateUrl: './podcast-library.page.html'
})
export class PodcastLibraryPage {
  readonly isCommentComposerOpen = signal(false);
  readonly expandedReplies = signal<Record<string, boolean>>({});

  openCommentComposer(): void {
    this.isCommentComposerOpen.set(true);
  }

  toggleReplies(commentId: string): void {
    this.expandedReplies.update((state) => ({
      ...state,
      [commentId]: !state[commentId],
    }));
  }

  areRepliesOpen(commentId: string): boolean {
    return this.expandedReplies()[commentId] ?? false;
  }
}

export const PODCAST_LIBRARY_ROUTES: Routes = [
  { path: '', component: PodcastLibraryPage },
  { path: ':id', component: PodcastLibraryPage },
];

