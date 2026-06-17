import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStateService } from '../auth-state.service';
import { environmentConfig } from '../../components/configs/environment.config';

export const apiPrefixInterceptor: HttpInterceptorFn = (request, next) => {
  const authState = inject(AuthStateService);
  const isAbsolute = /^https?:\/\//.test(request.url);
  const apiRequest = isAbsolute ? request : request.clone({ url: `${environmentConfig.apiBaseUrl}${request.url}` });
  const token = authState.token();
  const authenticatedRequest = token
    ? apiRequest.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : apiRequest;

  return next(authenticatedRequest);
};
