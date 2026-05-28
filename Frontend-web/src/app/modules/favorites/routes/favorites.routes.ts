import { Component } from '@angular/core';
import { RouterLink, Routes } from '@angular/router';
import { BackToTopComponent } from '../../../shared/back-to-top/back-to-top.component';
import { PublicFooterComponent } from '../../../shared/public-footer/public-footer.component';

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
  template: `
    <section class="-m-6 min-h-dvh bg-[#f7f8f8] text-[#2c2729]">
      <header class="sticky top-0 z-30 border-b border-[#e5e0e2] bg-white">
        <div class="mx-auto grid h-[48px] max-w-7xl grid-cols-[minmax(180px,1fr)_auto_minmax(180px,1fr)] items-center px-6">
          <a routerLink="/app/contents" class="flex min-w-max items-center gap-2 text-[#8a4055]">
            <img src="/auth-logo.png" alt="Economia com História" class="h-[20px] w-auto" />
            <span class="font-display text-[13px] font-extrabold leading-none">Economia com História</span>
          </a>

          <nav class="hidden h-full items-center justify-center gap-8 text-[10px] font-medium text-[#474043] md:flex">
            <a routerLink="/app/contents" class="relative flex h-full items-center text-[#8a4055] after:absolute after:bottom-[10px] after:left-0 after:h-px after:w-full after:bg-[#d4af37]">Home</a>
            <a routerLink="/app/contents" class="flex h-full items-center transition hover:text-[#8a4055]">História</a>
            <a routerLink="/app/contents" class="flex h-full items-center transition hover:text-[#8a4055]">Economia</a>
            <a routerLink="/app/podcasts" class="flex h-full items-center transition hover:text-[#8a4055]">Podcasts</a>
            <a routerLink="/app/forums" class="flex h-full items-center transition hover:text-[#8a4055]">Fórum</a>
          </nav>

          <a routerLink="/app/profile" class="ml-auto flex items-center gap-2 text-[10px] font-semibold text-[#2c2729]">
            <span>Marta Ribeiro</span>
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
              alt="Marta Ribeiro"
              class="size-7 rounded-full object-cover"
            />
          </a>
        </div>
      </header>

      <main class="mx-auto min-h-[760px] max-w-7xl px-6 pb-20 pt-12">
        <section class="max-w-[720px]">
          <h1 class="font-display text-[30px] font-extrabold leading-tight text-bordeaux">Itens Guardados</h1>
          <p class="mt-4 max-w-[560px] text-[12px] leading-6 text-[#6f686b]">
            A sua curadoria pessoal de conhecimento sobre a evolução económica e histórica de Angola.
            Explore os seus recursos favoritos abaixo.
          </p>
        </section>

        <div class="mt-10 flex flex-wrap items-center gap-4">
          @for (filter of filters; track filter) {
            <button
              type="button"
              class="h-9 min-w-[100px] rounded-lg border px-6 text-[11px] font-semibold transition hover:border-bordeaux hover:text-bordeaux"
              [class.border-bordeaux]="filter === 'Todos'"
              [class.bg-bordeaux]="filter === 'Todos'"
              [class.text-white]="filter === 'Todos'"
              [class.border-[#ded7da]]="filter !== 'Todos'"
              [class.bg-white]="filter !== 'Todos'"
              [class.text-[#6f686b]]="filter !== 'Todos'"
            >
              {{ filter }}
            </button>
          }
        </div>

        <div class="mt-12 grid max-w-[1185px] gap-7 sm:grid-cols-2 lg:grid-cols-3">
          @for (item of favorites; track item.title) {
            <article class="overflow-hidden border border-[#e4dde0] bg-white shadow-[0_1px_2px_rgba(22,19,21,0.03)]">
              <div
                class="relative h-[183px] overflow-hidden bg-[#171315]"
                [class.favorite-coffee]="item.visual === 'coffee'"
                [class.favorite-podcast]="item.visual === 'podcast'"
                [class.favorite-map]="item.visual === 'map'"
                [class.favorite-forum]="item.visual === 'forum'"
                [class.favorite-stage]="item.visual === 'stage'"
              >
                <span class="absolute left-4 top-4 bg-white/90 px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#4b4447]">
                  {{ item.eyebrow }}
                </span>
              </div>

              <div class="grid min-h-[205px] p-6">
                <h2 class="font-display text-[21px] font-extrabold leading-[1.08] text-bordeaux">{{ item.title }}</h2>
                <p class="mt-4 text-[12px] text-[#6f686b]">{{ item.author }}</p>
                <p class="mt-1 text-[11px] text-[#9a9497]">{{ item.meta }}</p>
                <div class="mt-auto flex items-center justify-between border-t border-[#f1ecee] pt-6">
                  <a routerLink="/app/contents" class="text-[11px] font-semibold text-[#2c2729]">{{ item.action }}</a>
                  <button type="button" class="text-[11px] font-semibold text-[#c5314a]">Remover</button>
                </div>
              </div>
            </article>
          }
        </div>
      </main>

      <app-public-footer />
      <app-back-to-top />
    </section>
  `,
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

