import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';

/** Activity log entry tracking user actions */
interface ActivityLogEntry {
  action: string;
  itemName?: string;
  timestamp: string;
  icon: string;
}

/**
 * Account Component
 *
 * Profile dashboard for the logged-in user. Access is protected by authGuard
 * so this page is only reachable after signing in via /login.
 *
 * Reads user identity from AuthService (which sources it from the mock JWT).
 * Owns an activity log that other components write to via the static
 * logActivity() helper.
 */
@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './account.component.html'
})
export class AccountComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);

  activityLog = signal<ActivityLogEntry[]>([]);
  sessionDuration = signal('');

  private timerInterval?: number;
  private readonly loginTime = Date.now();

  ngOnInit(): void {
    this.loadActivityLog();
    this.startSessionTimer();
    window.addEventListener('storage', this.onStorage);
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
    window.removeEventListener('storage', this.onStorage);
  }

  // ── Session timer ───────────────────────────────────────────────────────────

  private startSessionTimer(): void {
    this.updateDuration();
    this.timerInterval = window.setInterval(() => this.updateDuration(), 1000);
  }

  private updateDuration(): void {
    const elapsed = Math.floor((Date.now() - this.loginTime) / 1000);
    const s = elapsed % 60;
    const m = Math.floor(elapsed / 60) % 60;
    const h = Math.floor(elapsed / 3600);
    if (h > 0) {
      this.sessionDuration.set(`${h}h ${m}m ${s}s`);
    } else if (m > 0) {
      this.sessionDuration.set(`${m}m ${s}s`);
    } else {
      this.sessionDuration.set(`${s}s`);
    }
  }

  // ── Activity log ────────────────────────────────────────────────────────────

  private readonly onStorage = (e: StorageEvent) => {
    if (e.key === 'activityLog') this.loadActivityLog();
  };

  private loadActivityLog(): void {
    try {
      const stored = localStorage.getItem('activityLog');
      this.activityLog.set(stored ? (JSON.parse(stored) as ActivityLogEntry[]).slice(0, 10) : []);
    } catch {
      this.activityLog.set([]);
    }
  }

  /** Called from other components (e.g. create, edit, delete) to append an entry. */
  static logActivity(action: string, itemName?: string, icon = '📝'): void {
    const entry: ActivityLogEntry = { action, itemName, timestamp: new Date().toLocaleString(), icon };
    try {
      const stored = localStorage.getItem('activityLog');
      const log: ActivityLogEntry[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem('activityLog', JSON.stringify([entry, ...log].slice(0, 10)));
    } catch { /* ignore */ }
  }

  // ── Auth ────────────────────────────────────────────────────────────────────

  logout(): void {
    AccountComponent.logActivity('Logged out', undefined, '🚪');
    this.auth.logout();
  }
}
