import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink, Routes } from '@angular/router';
import { BackendContent } from '../../services/content.service';
import { SavedContentService } from '../../services/saved-content.service';
import { BackToTopComponent } from '../shared/back-to-top/back-to-top.component';
import { PublicFooterComponent } from '../shared/public-footer/public-footer.component';
import { PublicNavbarComponent } from '../shared/public-navbar/public-navbar.component';

interface FavoriteItem {
  id: string;
  type: 'texto' | 'podcast' | 'video' | 'jindungo';
  eyebrow: string;
  title: string;
  excerpt: string;
  author: string;
  meta: string;
  route: unknown[];
  action: string;
  imageUrl?: string;
  authorInitials: string;
  premium: boolean;
}

@Component({
  selector: 'app-favorites-page',
  imports: [RouterLink, PublicNavbarComponent, PublicFooterComponent, BackToTopComponent],
  templateUrl: './favorites-page.html',
})
export class FavoritesPage implements OnInit {
  private readonly savedContentService = inject(SavedContentService);

  readonly filters = ['Todos', 'Textos', 'Podcasts', 'Vídeos', 'Jindungo'];
  readonly selectedFilter = signal(this.filters[0]);
  readonly favorites = signal<FavoriteItem[]>([]);
  readonly isLoading = signal(true);
  readonly isRemoving = signal<string | null>(null);
  readonly feedbackMessage = signal('');
  readonly errorMessage = signal('');

  readonly filteredFavorites = computed(() => {
    const filter = this.selectedFilter();
    const items = this.favorites();

    if (filter === 'Todos') {
      return items;
    }

    const typeByFilter: Record<string, FavoriteItem['type'] | undefined> = {
      Textos: 'texto',
      Podcasts: 'podcast',
      Vídeos: 'video',
      Jindungo: 'jindungo',
    };

    const selectedType = typeByFilter[filter];

    return selectedType ? items.filter((item) => item.type === selectedType) : items;
  });

  async ngOnInit(): Promise<void> {
    await this.loadFavorites();
  }

  async loadFavorites(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const savedContents = await this.savedContentService.getMine();
      this.favorites.set(
        savedContents
          .map((item) => item.content)
          .filter(Boolean)
          .map((content) => this.toFavoriteItem(content!)),
      );
    } catch {
      this.errorMessage.set('Não foi possível carregar os conteúdos guardados.');
      this.favorites.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  async removeFavorite(item: FavoriteItem): Promise<void> {
    if (this.isRemoving()) {
      return;
    }

    const previousItems = this.favorites();

    this.isRemoving.set(item.id);
    this.feedbackMessage.set('');
    this.errorMessage.set('');
    this.favorites.update((items) => items.filter((favorite) => favorite.id !== item.id));

    try {
      await this.savedContentService.remove(item.id);
      this.feedbackMessage.set('Conteúdo removido dos guardados.');
    } catch {
      this.favorites.set(previousItems);
      this.errorMessage.set('Não foi possível remover este conteúdo dos guardados.');
    } finally {
      this.isRemoving.set(null);
    }
  }

  private toFavoriteItem(content: BackendContent): FavoriteItem {
    const contentType = content.content_type?.name ?? 'Texto';
    const contentTypeSlug = this.normalizeText(content.content_type?.slug ?? contentType);
    const type = this.toFavoriteType(contentTypeSlug);
    const authorName = content.author?.name ?? content.user?.name ?? 'Equipa editorial';

    return {
      id: String(content.id),
      type,
      eyebrow: type === 'jindungo' ? 'Jindungo' : contentType,
      title: content.title,
      excerpt: content.summary || this.toExcerpt(content.content),
      author: authorName,
      authorInitials: this.getInitials(authorName),
      meta: this.buildMeta(content.created_at, contentType),
      route: this.contentRoute(String(content.id), type),
      action: type === 'podcast' ? 'Ouvir' : type === 'video' ? 'Ver vídeo' : 'Ler agora',
      imageUrl: content.image || undefined,
      premium: type === 'jindungo',
    };
  }

  private contentRoute(id: string, type: FavoriteItem['type']): unknown[] {
    if (type === 'podcast') {
      return ['/app/podcasts', id];
    }

    if (type === 'video') {
      return ['/app/contents/videos', id];
    }

    return ['/app/contents', id];
  }

  private toFavoriteType(contentTypeSlug: string): FavoriteItem['type'] {
    if (contentTypeSlug.includes('podcast')) {
      return 'podcast';
    }

    if (contentTypeSlug.includes('video')) {
      return 'video';
    }

    if (contentTypeSlug.includes('jindungo')) {
      return 'jindungo';
    }

    return 'texto';
  }

  private buildMeta(createdAt: string | null | undefined, contentType: string): string {
    const date = createdAt ? new Date(createdAt) : null;
    const formattedDate =
      date && !Number.isNaN(date.getTime())
        ? new Intl.DateTimeFormat('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
        : 'Sem data';

    return `${formattedDate} - ${contentType}`;
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  private toExcerpt(value: string | null | undefined): string {
    if (!value) {
      return 'Conteúdo disponível na biblioteca Economia com História.';
    }

    return value.replace(/<[^>]*>/g, '').slice(0, 180);
  }
}

export const FAVORITES_ROUTES: Routes = [{ path: '', component: FavoritesPage }];
