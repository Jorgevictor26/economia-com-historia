import { Routes } from '@angular/router';

export const FAVORITES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../pages/favorites/favorites.page').then((m) => m.FavoritesPage),
  },
];
