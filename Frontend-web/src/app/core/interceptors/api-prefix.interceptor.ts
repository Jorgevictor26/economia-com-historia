import { HttpInterceptorFn } from '@angular/common/http';
import { environmentConfig } from '../configs/environment.config';

export const apiPrefixInterceptor: HttpInterceptorFn = (request, next) => {
  const isAbsolute = /^https?:\/\//.test(request.url);
  const apiRequest = isAbsolute ? request : request.clone({ url: `${environmentConfig.apiBaseUrl}${request.url}` });

  return next(apiRequest);
};
