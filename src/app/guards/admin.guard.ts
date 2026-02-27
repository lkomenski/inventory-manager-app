import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

/**
 * admin.guard.ts
 *
 * CanActivate guard that protects admin-only routes.
 * Only users with role 'admin' can access these routes.
 * Others are redirected to the home page.
 *
 * Usage:
 *   {
 *     path: 'admin',
 *     component: AdminComponent,
 *     canActivate: [authGuard, adminGuard]
 *   }
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const role = authService.getRole();

  if (role === 'admin') {
    return true; // Allow navigation
  }

  // Not an admin – redirect to home
  router.navigate(['/']);
  return false;
};
