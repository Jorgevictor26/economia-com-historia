import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from './auth-state.service';

export const adminDashboardGuard: CanActivateFn = () => {
  const auth = inject(AuthStateService);
  const router = inject(Router);

  if (auth.canManagePlatform()) {
    return true;
  }

  return auth.canWriteContent() ? router.createUrlTree(['/admin/contents']) : router.createUrlTree(['/app/contents']);
};

export const contentWriterGuard: CanActivateFn = () => {
  const auth = inject(AuthStateService);
  const router = inject(Router);

  return auth.canWriteContent() || router.createUrlTree(['/app/contents']);
};

export const platformManagerGuard: CanActivateFn = () => {
  const auth = inject(AuthStateService);
  const router = inject(Router);

  return auth.canManagePlatform() || router.createUrlTree(['/admin/contents']);
};

export const userManagerGuard: CanActivateFn = () => {
  const auth = inject(AuthStateService);
  const router = inject(Router);

  return auth.canManageUsers() || router.createUrlTree(['/admin/contents']);
};

export const jindungoManagerGuard: CanActivateFn = () => {
  const auth = inject(AuthStateService);
  const router = inject(Router);

  return auth.canCreateJindungo() || router.createUrlTree(['/admin']);
};
