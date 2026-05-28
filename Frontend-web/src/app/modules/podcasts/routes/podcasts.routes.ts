import { Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  selector: 'app-podcasts-page',
  template: `
    <section class="mx-auto max-w-6xl rounded-lg bg-white p-8 shadow-sm">
      <h1 class="text-3xl font-extrabold text-bordeaux">Podcasts</h1>
      <p class="mt-3 text-black/60">Listagem e reprodução de episódios preparada para API REST.</p>
    </section>
  `,
})
export class PodcastsPage {}

export const PODCASTS_ROUTES: Routes = [{ path: '', component: PodcastsPage }];
