import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

/**
 * Protects routes that require the 'admin' role.
 * Redirects non-admins to the home page.
 * Redirects unauthenticated users to /login first.
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  if (auth.getRole() === 'admin') {
    return true;
  }

  // Logged in but not an admin — send home
  return router.createUrlTree(['/']);
};
