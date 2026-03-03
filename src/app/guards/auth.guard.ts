import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

/**
 * auth.guard.ts
 *
 * CanActivate guard that restricts access to authenticated users.
 * Reads the current login state from AuthService and redirects
 * unauthenticated visitors to /auth/login, preserving the intended
 * destination in a returnUrl query parameter for post-login redirect.
 *
 * Usage:
 *   {
 *     path: 'account',
 *     component: AccountComponent,
 *     canActivate: [authGuard]
 *   }
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Redirect to login and pass the original URL so the user can be sent
  // back after a successful login.
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
