/**
 * account.component.ts
 *
 * Post-login dashboard page. Shows the current user's email, a live
 * token expiry countdown, quick navigation to inventory actions, and
 * a logout button.
 */

import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './account.component.html'
})
export class AccountComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);

  /** Decoded user from the JWT — provides email and role directly from the token. */
  currentUser = this.authService.currentUser;

  /** True when the logged-in user has the admin role. */
  isAdmin = () => this.authService.getRole() === 'admin';

  /** Countdown string showing time remaining on the JWT (e.g. "14m 32s"). */
  tokenExpiresIn = signal('');

  private timerInterval?: number;

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