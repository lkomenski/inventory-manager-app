import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

/**
 * admin.guard.ts
 *
 * CanActivate guard that restricts access to users with the 'admin' role.
 * Reads the role claim decoded from the current JWT via AuthService.
 * Non-admin users are redirected to the home page.
 *
 * Compose with authGuard so authentication is checked first:
 *   {
 *     path: 'admin',
 *     component: AdminComponent,
 *     canActivate: [authGuard, adminGuard]
 *   }
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getRole() === 'admin') {
    return true;
  }

  // Insufficient role — redirect to home rather than exposing the admin route.
  router.navigate(['/']);
  return false;
};
