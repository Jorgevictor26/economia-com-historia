import { Routes } from '@angular/router';
import { EditProfilePage } from '../pages/edit-profile/edit-profile.page';
import { ProfilePage } from '../pages/profile/profile.page';

export const PROFILE_ROUTES: Routes = [
  { path: 'edit', component: EditProfilePage },
  { path: '', component: ProfilePage },
];
