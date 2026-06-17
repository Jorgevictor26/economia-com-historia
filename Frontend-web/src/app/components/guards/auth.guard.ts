import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthStateService);

  if (auth.isAuthenticated()) {
    return true;
  }

  auth.requireLoginFor((route.data?.['loginOperation'] as string | undefined) ?? 'continuar');
  return false;
};
