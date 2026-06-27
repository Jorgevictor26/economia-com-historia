import { Component, inject } from '@angular/core';
import { RouterLink, Routes } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';
import { BackToTopComponent } from '../shared/back-to-top/back-to-top.component';
import { PublicFooterComponent } from '../shared/public-footer/public-footer.component';
import { PublicNavbarComponent } from '../shared/public-navbar/public-navbar.component';

@Component({
  selector: 'app-jindungo-library-page',
  imports: [RouterLink, PublicNavbarComponent, PublicFooterComponent, BackToTopComponent],
  templateUrl: './jindungo-library.page.html'
})
export class JindungoLibraryPage {
  readonly auth = inject(AuthStateService);

  requireLogin(event: Event, operation: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.auth.requireLoginFor(operation);
  }

  readonly editions = [
    {
      title: 'A Crise do Petróleo e os Pactos Regionais',
      text: 'Como as oscilações do crude afetaram decisões de soberania económica.',
      image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Infraestruturas e Círculos Comerciais do Kwanza',
      text: 'Leitura histórica sobre circulação, transporte e tributação.',
      image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'O Papel das Moedas no Comércio Colonial Angolano',
      text: 'Da moeda local às instituições financeiras modernas.',
      image: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&w=600&q=80',
    },
  ];

}

export const JINDUNGO_LIBRARY_ROUTES: Routes = [{ path: '', component: JindungoLibraryPage }];






