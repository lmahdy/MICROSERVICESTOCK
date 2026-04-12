import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { from, switchMap, catchError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloak = inject(KeycloakService);

  // Only job: attach token if available. Never redirect.
  // keycloak-init.ts (onLoad: 'login-required') handles login.
  return from(keycloak.getToken()).pipe(
    switchMap((token) => {
      if (!token) return next(req);
      return next(req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      }));
    }),
    catchError(() => next(req))
  );
};

