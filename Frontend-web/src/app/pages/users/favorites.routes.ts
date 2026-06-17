import { Component } from '@angular/core';
import { RouterLink, Routes } from '@angular/router';
import { BackToTopComponent } from '../shared/back-to-top/back-to-top.component';
import { PublicFooterComponent } from '../shared/public-footer/public-footer.component';

interface FavoriteItem {
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
  imports: [RouterLink, PublicFooterComponent, BackToTopComponent],
  templateUrl: './favorites-page.html'
})
export class FavoritesPage {
  readonly filters = ['Todos', 'Artigos', 'Podcasts', 'Quizzes', 'Fóruns'];

  readonly favorites: FavoriteItem[] = [
    {
      type: 'artigo',
      eyebrow: 'Artigo',
      title: 'A Economia do Café e o Impacto Social...',
      author: 'Dr. Manuel dos Santos',
      meta: '12 de Março, 2024',
      action: 'Ler Agora',
      visual: 'coffee',
    },
    {
      type: 'podcast',
      eyebrow: 'Podcast',
      title: 'Ep. 42: Ouro Negro e o Futuro...',
      author: 'Ana Clara Ribeiro',
      meta: '06 de Abril, 2024',
      action: 'Ouvir Podcast',
      visual: 'podcast',
    },
    {
      type: 'quiz',
      eyebrow: 'Quiz',
      title: 'Desafio: Cronologia da Independência',
      author: 'Departamento de História',
      meta: '28 de Fevereiro, 2024',
      action: 'Iniciar Quiz',
      visual: 'map',
    },
    {
      type: 'forum',
      eyebrow: 'Fórum',
      title: 'Discussão: Diversificação Pós-...',
      author: 'Comunidade de Economia',
      meta: '02 de Maio, 2024',
      action: 'Ver Tópico',
      visual: 'forum',
    },
    {
      type: 'artigo',
      eyebrow: 'Artigo',
      title: 'Mercados Informais: O...',
      author: 'Isabel Ventura',
      meta: '20 de Abril, 2024',
      action: 'Ler Agora',
      visual: 'stage',
    },
  ];

}

export const FAVORITES_ROUTES: Routes = [{ path: '', component: FavoritesPage }];



