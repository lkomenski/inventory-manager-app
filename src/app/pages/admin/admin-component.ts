/**
 * admin-component.ts
 *
 * Admin-only dashboard page, protected by both authGuard and adminGuard.
 * Displays the current admin's account info and a summary of system stats.
 *
 * adminStats is a signal holding placeholder values that can be wired up
 * to a real admin service in the future without changing the template.
 */

import { Component, signal, inject, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../services/auth-service";

@Component({
  selector: "app-admin",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./admin-component.html"
})
export class AdminComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);

  /** Decoded user info from the current JWT — contains email and role. */
  currentUser = this.authService.currentUser;

  tokenExpiresIn = signal('');
  private timerInterval?: number;

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

  ngOnInit(): void {
    this.updateExpiry();
    this.timerInterval = window.setInterval(() => this.updateExpiry(), 1000);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  private updateExpiry(): void {
    const expiry = this.authService.getTokenExpiry();
    if (!expiry) { this.tokenExpiresIn.set(''); return; }
    const remaining = expiry * 1000 - Date.now();
    if (remaining <= 0) { this.tokenExpiresIn.set('Expired'); return; }
    const rs = Math.floor(remaining / 1000);
    const rm = Math.floor(rs / 60);
    const rh = Math.floor(rm / 60);
    if (rh > 0) {
      this.tokenExpiresIn.set(`${rh}h ${rm % 60}m ${rs % 60}s`);
    } else if (rm > 0) {
      this.tokenExpiresIn.set(`${rm}m ${rs % 60}s`);
    } else {
      this.tokenExpiresIn.set(`${rs}s`);
    }
  }

  onLogout(): void {
    this.authService.logout();
  }
}
