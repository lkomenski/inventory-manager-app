import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth-service';

/**
 * Navigation Bar Component
 * 
 * Responsive navigation menu with mobile hamburger toggle.
 * Displays links to Home, Objects List, Create, Account, and Admin Panel (for admins).
 * Also shows a Logout button for authenticated users.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  private authService = inject(AuthService);
  
  mobileMenuOpen = signal(false);  // Controls mobile menu visibility

  // Expose auth and role info to template
  isLoggedIn = this.authService.isLoggedIn.bind(this.authService);
  userRole = this.authService.getRole.bind(this.authService);

  /** Toggle mobile menu open/closed */
  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(value => !value);
  }

  /** Close mobile menu (called when a link is clicked) */
  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  /** Handle logout */
  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
  }
}
