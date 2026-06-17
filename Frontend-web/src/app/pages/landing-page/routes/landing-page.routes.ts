import { Routes } from '@angular/router';

export const LANDING_PAGE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../pages/landing/landing.page').then((m) => m.LandingPage),
  },
];
