import { Routes } from '@angular/router';
import { ProfilePage } from './profile.page';

export const PROFILE_ROUTES: Routes = [
  { path: 'edit', pathMatch: 'full', redirectTo: '' },
  { path: 'history', component: ProfilePage, data: { section: 'history' } },
  { path: 'support', component: ProfilePage, data: { section: 'support' } },
  { path: 'photo', component: ProfilePage, data: { section: 'photo' } },
  { path: 'security', component: ProfilePage, data: { section: 'security' } },
  { path: '', component: ProfilePage },
];

