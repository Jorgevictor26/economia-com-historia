import { Routes } from '@angular/router';

export const VIDEO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../pages/video/video.page').then((m) => m.VideoPage),
  },
];
