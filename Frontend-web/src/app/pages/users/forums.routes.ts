import { Component, inject } from '@angular/core';
import { Routes } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';
import { ForumService } from '../../services/forum.service';
import { BackToTopComponent } from '../shared/back-to-top/back-to-top.component';
import { PublicFooterComponent } from '../shared/public-footer/public-footer.component';
import { PublicNavbarComponent } from '../shared/public-navbar/public-navbar.component';

@Component({
  selector: 'app-forums-page',
  imports: [PublicNavbarComponent, PublicFooterComponent, BackToTopComponent],
  templateUrl: './forums-page.html'
})
export class ForumsPage {
  readonly auth = inject(AuthStateService);
  readonly forumService = inject(ForumService);

  requireLogin(event: Event, operation: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.auth.requireLoginFor(operation);
  }
}

export const FORUMS_ROUTES: Routes = [{ path: '', component: ForumsPage }];






