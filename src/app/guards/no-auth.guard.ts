import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

/**
 * no-auth.guard.ts
 *
 * CanActivate guard that blocks already-authenticated users from reaching
 * the login and register pages. If a logged-in user navigates to /auth/login
 * or /auth/register, they are redirected to /account instead.
 *
 * This prevents the awkward situation where a logged-in user can re-submit
 * the login form and accidentally overwrite their active session.
 *
 * Usage:
 *   {
 *     path: 'auth/login',
 *     component: LoginComponent,
 *     canActivate: [noAuthGuard]
 *   }
 */
export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    router.navigate(['/account']);
    return false;
  }

  return true;
};
