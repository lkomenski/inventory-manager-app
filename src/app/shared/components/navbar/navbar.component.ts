import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth-service';

/**
 * navbar.component.ts
 *
 * Sticky top navigation bar rendered on every page via the root app shell.
 * Adapts to two layouts: a full desktop menu bar and a collapsible mobile
 * flyout triggered by a hamburger button.
 *
 * Auth-aware: nav links and the Logout button are only shown to authenticated
 * users; the Admin Panel link is further gated behind the 'admin' role.
 * All auth state is read from AuthService signals — no local state is stored.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  private authService = inject(AuthService);

  /** Tracks whether the mobile flyout menu is currently visible. */
  mobileMenuOpen = signal(false);

  /** Bound method — returns true when a valid JWT is present in storage. */
  isLoggedIn = this.authService.isLoggedIn.bind(this.authService);

  /** Bound method — returns the role string ('admin' | 'user') from the JWT. */
  userRole = this.authService.getRole.bind(this.authService);

  /** Toggle mobile menu open/closed. */
  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(value => !value);
  }

  /** Close mobile menu — called on every nav-link click to dismiss the overlay. */
  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  /** Log the user out and close the mobile menu regardless of viewport size. */
  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
  }
}
