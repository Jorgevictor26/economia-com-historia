import { Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  selector: 'app-podcasts-page',
  templateUrl: './podcasts-page.html'
})
export class PodcastsPage {}

export const PODCASTS_ROUTES: Routes = [{ path: '', component: PodcastsPage }];

