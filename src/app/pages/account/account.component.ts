/**
 * account.component.ts
 *
 * Post-login dashboard page. Displays the current user's profile,
 * a live session duration timer, recent activity, and quick navigation
 * to inventory actions.
 *
 * Session state (email, login timestamp, rememberMe) is read from
 * localStorage so the page survives a browser refresh. Activity log
 * entries are also persisted there so other pages can append to them
 * via the static AccountComponent.logActivity() helper.
 */

import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';

/** A single entry in the activity log shown on the dashboard. */
interface ActivityLogEntry {
  action: string;      // Description of the action (e.g., "Logged in", "Created item")
  itemName?: string;   // Name of the affected item, if applicable
  timestamp: string;   // Human-readable date/time string
}

/**
 * Dashboard Component
 * 
 * Post-login dashboard page with features:
 * - User profile display
 * - Real-time session duration timer
 * - Activity log tracking recent actions
 * - Navigation to inventory management
 * - Logout functionality
 * 
 * Note: This component requires the user to be authenticated.
 * Use route guards to protect this page.
 */
@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './account.component.html'
})
export class AccountComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);

  /** Decoded user from the JWT — provides email and role directly from the token. */
  currentUser = this.authService.currentUser;

  /** True when the logged-in user has the admin role. */
  isAdmin = () => this.authService.getRole() === 'admin';

  userEmail = signal('');
  loginDate = signal('');
  loginTimestamp = signal<number>(0);
  sessionDuration = signal('');
  /** Countdown string showing time remaining on the JWT (e.g. "7h 43m 12s"). */
  tokenExpiresIn = signal('');
  rememberMe = signal(false);
  activityLog = signal<ActivityLogEntry[]>([]);

  private timerInterval?: number;  // setInterval ID — cleared in ngOnDestroy

  constructor() {
    // Check localStorage for existing session
    const savedEmail = localStorage.getItem('userEmail');
    const savedDate = localStorage.getItem('loginDate');
    const savedTimestamp = localStorage.getItem('loginTimestamp');
    const savedRememberMe = localStorage.getItem('rememberMe');
    
    if (savedEmail) {
      // Restore session data
      this.userEmail.set(savedEmail);
      this.loginDate.set(savedDate || new Date().toLocaleDateString());
      this.loginTimestamp.set(parseInt(savedTimestamp || '0', 10));
      this.rememberMe.set(savedRememberMe === 'true');
    }
    
    // Load activity log from localStorage
    this.loadActivityLog();
  }
  
  
  ngOnInit(): void {
    // Start real-time session timer
    this.startSessionTimer();
    
    // Listen for changes to activity log from other browser tabs/windows
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }
  
  ngOnDestroy(): void {
    // Clean up timer and event listener when component is destroyed
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
  }
  
  /** Handle storage events from other tabs/windows */
  private handleStorageChange(event: StorageEvent): void {
    if (event.key === 'activityLog') {
      this.loadActivityLog();  // Reload activity log when it changes
    }
  }
  
  /** Start interval timer that updates the displayed session duration every second. */
  private startSessionTimer(): void {
    this.updateSessionDuration();  // Initial update
    this.timerInterval = window.setInterval(() => {
      this.updateSessionDuration();
    }, 1000);  // Update every 1 second
  }
  
  /**
   * Calculate and format session duration in human-readable format
   * Examples: "5s", "2m 15s", "1h 30m 45s", "2d 5h 20m"
   */
  private updateSessionDuration(): void {
    const elapsed = Date.now() - this.loginTimestamp();
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    // Format based on duration length for readability
    if (days > 0) {
      this.sessionDuration.set(`${days}d ${hours % 24}h ${minutes % 60}m`);
    } else if (hours > 0) {
      this.sessionDuration.set(`${hours}h ${minutes % 60}m ${seconds % 60}s`);
    } else if (minutes > 0) {
      this.sessionDuration.set(`${minutes}m ${seconds % 60}s`);
    } else {
      this.sessionDuration.set(`${seconds}s`);
    }

    // Update the token expiry countdown
    const expiry = this.authService.getTokenExpiry();
    if (expiry) {
      const remaining = expiry * 1000 - Date.now();
      if (remaining <= 0) {
        this.tokenExpiresIn.set('Expired');
      } else {
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
    }
  }
  
  /** Load the activity log from localStorage, capping at the 10 most recent entries. */
  private loadActivityLog(): void {
    const stored = localStorage.getItem('activityLog');
    if (stored) {
      try {
        const log = JSON.parse(stored) as ActivityLogEntry[];
        // Keep only last 10 entries
        this.activityLog.set(log.slice(0, 10));
      } catch (e) {
        this.activityLog.set([]);
      }
    }
  }

  onLogout(): void {
    // Add logout to activity log before clearing
    this.addActivityLogEntry('Logged out');
    
    this.clearSession();
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Call auth service logout and redirect
    this.authService.logout();
  }
  
  private clearSession(): void {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('loginDate');
    localStorage.removeItem('loginTimestamp');
    localStorage.removeItem('rememberMe');
    this.userEmail.set('');
    this.loginDate.set('');
    this.sessionDuration.set('');
    this.rememberMe.set(false);
  }
  
  private addActivityLogEntry(action: string, itemName?: string): void {
    const entry: ActivityLogEntry = {
      action,
      itemName,
      timestamp: new Date().toLocaleString()
    };
    
    const currentLog = this.activityLog();
    const newLog = [entry, ...currentLog].slice(0, 10); // Keep only last 10
    this.activityLog.set(newLog);
    localStorage.setItem('activityLog', JSON.stringify(newLog));
  }
  
  /**
   * Static helper so any page component can append an activity log entry
   * without needing a reference to this component instance.
   * Called from create, edit, and delete flows after a successful API operation.
   */
  static logActivity(action: string, itemName?: string): void {
    const entry: ActivityLogEntry = {
      action,
      itemName,
      timestamp: new Date().toLocaleString()
    };
    
    const stored = localStorage.getItem('activityLog');
    let log: ActivityLogEntry[] = [];
    if (stored) {
      try {
        log = JSON.parse(stored);
      } catch (e) {
        log = [];
      }
    }
    
    log = [entry, ...log].slice(0, 10);
    localStorage.setItem('activityLog', JSON.stringify(log));
  }
}