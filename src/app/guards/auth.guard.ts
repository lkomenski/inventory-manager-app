import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

/**
 * auth.guard.ts
 *
 * CanActivate guard that protects routes for logged-in users only.
 * If the user is not logged in, they're redirected to /auth/login.
 *
 * Usage:
 *   {
 *     path: 'products',
 *     component: ProductListComponent,
 *     canActivate: [authGuard]
 *   }
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; // Allow navigation
  }

  // Not logged in – redirect to login page and save the original URL
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
