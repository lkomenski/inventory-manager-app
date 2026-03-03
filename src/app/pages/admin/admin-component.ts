/**
 * admin-component.ts
 *
 * Admin-only dashboard page, protected by both authGuard and adminGuard.
 * Displays the current admin's account info and a summary of system stats.
 *
 * adminStats is a signal holding placeholder values that can be wired up
 * to a real admin service in the future without changing the template.
 */

import { Component, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../services/auth-service";

@Component({
  selector: "app-admin",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./admin-component.html"
})
export class AdminComponent {
  private authService = inject(AuthService);

  /** Decoded user info from the current JWT — contains email and role. */
  currentUser = this.authService.currentUser;

  /**
   * Placeholder system stats shown on the admin dashboard.
   * Extend by injecting an AdminService and replacing these defaults
   * with real API data.
   */
  adminStats = signal({
    totalUsers: 2,               // admin + demo user
    systemStatus: 'Operational',
    lastBackup: new Date().toLocaleDateString()
  });
}
