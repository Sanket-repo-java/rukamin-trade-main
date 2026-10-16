import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const requireAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(AuthService).isAuthenticated() || router.createUrlTree(['/login']);
};

export const signedOutGuard: CanActivateFn = () => {
  const router = inject(Router);
  return !inject(AuthService).isAuthenticated() || router.createUrlTree(['/trading']);
};