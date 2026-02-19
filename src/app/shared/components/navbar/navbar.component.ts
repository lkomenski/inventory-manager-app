import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

/**
 * Navigation Bar Component
 * 
 * Responsive navigation menu with mobile hamburger toggle.
 * Displays links to Home, Objects List, Create, and Account pages.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  mobileMenuOpen = signal(false);  // Controls mobile menu visibility

  /** Toggle mobile menu open/closed */
  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(value => !value);
  }

  /** Close mobile menu (called when a link is clicked) */
  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
