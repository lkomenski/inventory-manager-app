import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';

/** Activity log entry tracking user actions */
interface ActivityLogEntry {
  action: string;      // Description of the action (e.g., "Logged in", "Created item")
  itemName?: string;   // Name of item affected (if applicable)
  timestamp: string;   // When the action occurred
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

  userEmail = signal('');
  loginDate = signal('');  
  loginTimestamp = signal<number>(0);  
  sessionDuration = signal('');  
  rememberMe = signal(false);  
  activityLog = signal<ActivityLogEntry[]>([]);  
  
  private timerInterval?: number;  // SetInterval ID for session timer

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
  
  /** Start interval timer that updates session duration every second */
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
  }
  
  /** Load activity log from localStorage and keep only last 10 entries */
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
  
  // Public method that can be called from other components
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