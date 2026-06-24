import { Component, computed, signal } from '@angular/core';
import { RouterLink, Routes } from '@angular/router';
import { BackToTopComponent } from '../shared/back-to-top/back-to-top.component';
import { PublicFooterComponent } from '../shared/public-footer/public-footer.component';
import { PublicNavbarComponent } from '../shared/public-navbar/public-navbar.component';

interface FavoriteItem {
  id: string;
  type: 'artigo' | 'podcast' | 'quiz' | 'forum';
  eyebrow: string;
  title: string;
  author: string;
  meta: string;
  action: string;
  visual: 'coffee' | 'podcast' | 'map' | 'forum' | 'stage';
}

@Component({
  selector: 'app-favorites-page',
  imports: [RouterLink, PublicNavbarComponent, PublicFooterComponent, BackToTopComponent],
  templateUrl: './favorites-page.html'
})
export class FavoritesPage {
  readonly filters = ['Todos', 'Artigos', 'Podcasts', 'Quizzes', 'Fóruns'];
  readonly selectedFilter = signal(this.filters[0]);

  readonly filteredFavorites = computed(() => {
    const filter = this.selectedFilter();
    const items = this.favorites();

    if (filter === 'Todos') {
      return items;
    }

    const typeByFilter: Record<string, FavoriteItem['type']> = {
      Artigos: 'artigo',
      Podcasts: 'podcast',
      Quizzes: 'quiz',
      Fóruns: 'forum',
    };

    return items.filter((item) => item.type === typeByFilter[filter]);
  });

  readonly favorites = signal<FavoriteItem[]>([
    {
      id: 'economia-cafe',
      type: 'artigo',
      eyebrow: 'Artigo',
      title: 'A Economia do Café e o Impacto Social...',
      author: 'Dr. Manuel dos Santos',
      meta: '12 de Março, 2024',
      action: 'Ler Agora',
      visual: 'coffee',
    },
    {
      id: 'ouro-negro',
      type: 'podcast',
      eyebrow: 'Podcast',
      title: 'Ep. 42: Ouro Negro e o Futuro...',
      author: 'Ana Clara Ribeiro',
      meta: '06 de Abril, 2024',
      action: 'Ouvir Podcast',
      visual: 'podcast',
    },
    {
      id: 'cronologia-independencia',
      type: 'quiz',
      eyebrow: 'Quiz',
      title: 'Desafio: Cronologia da Independência',
      author: 'Departamento de História',
      meta: '28 de Fevereiro, 2024',
      action: 'Iniciar Quiz',
      visual: 'map',
    },
    {
      id: 'diversificacao-pos',
      type: 'forum',
      eyebrow: 'Fórum',
      title: 'Discussão: Diversificação Pós-...',
      author: 'Comunidade de Economia',
      meta: '02 de Maio, 2024',
      action: 'Ver Tópico',
      visual: 'forum',
    },
    {
      id: 'mercados-informais',
      type: 'artigo',
      eyebrow: 'Artigo',
      title: 'Mercados Informais: O...',
      author: 'Isabel Ventura',
      meta: '20 de Abril, 2024',
      action: 'Ler Agora',
      visual: 'stage',
    },
  ]);

  removeFavorite(id: string): void {
    this.favorites.update((items) => items.filter((item) => item.id !== id));
  }

}

export const FAVORITES_ROUTES: Routes = [{ path: '', component: FavoritesPage }];



