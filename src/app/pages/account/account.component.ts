import { Component, signal, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

/** Activity log entry tracking user actions */
interface ActivityLogEntry {
  action: string;      // Description of the action (e.g., "Logged in", "Created item")
  itemName?: string;   // Name of item affected (if applicable)
  timestamp: string;   // When the action occurred
  icon: string;        // Emoji icon to display
}

/**
 * Account Component
 * 
 * Demo account management page with features:
 * - Login/logout functionality
 * - Password visibility toggle
 * - "Remember me" option (extends session from 1 day to 30 days)
 * - Real-time session duration timer
 * - Activity log tracking recent actions
 * 
 * Note: This is a demo implementation using localStorage.
 * In production, use proper authentication with backend API.
 */
@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './account.component.html'
})
export class AccountComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isLoggedIn = signal(false);
  userEmail = signal('');
  loginDate = signal('');  
  loginTimestamp = signal<number>(0);  
  sessionDuration = signal('');  
  showPassword = signal(false);  
  rememberMe = signal(false);  
  activityLog = signal<ActivityLogEntry[]>([]);  
  
  private timerInterval?: number;  // SetInterval ID for session timer

  constructor(private fb: FormBuilder) {
    // Initialize login form with validators
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });

    // Check localStorage for existing session
    const savedEmail = localStorage.getItem('userEmail');
    const savedDate = localStorage.getItem('loginDate');
    const savedTimestamp = localStorage.getItem('loginTimestamp');
    const savedRememberMe = localStorage.getItem('rememberMe');
    
    if (savedEmail) {
      // Verify session hasn't expired
      const isRemembered = savedRememberMe === 'true';
      const sessionAge = Date.now() - parseInt(savedTimestamp || '0', 10);
      const maxAge = isRemembered 
        ? 30 * 24 * 60 * 60 * 1000  // 30 days if "Remember me" was checked
        : 24 * 60 * 60 * 1000;       // 1 day for normal session
      
      if (sessionAge < maxAge) {
        // Session still valid - restore login state
        this.isLoggedIn.set(true);
        this.userEmail.set(savedEmail);
        this.loginDate.set(savedDate || new Date().toLocaleDateString());
        this.loginTimestamp.set(parseInt(savedTimestamp || '0', 10));
        this.rememberMe.set(isRemembered);
      } else {
        // Session expired - clear old data
        this.clearSessionData();
      }
    }
    
    // Load activity log from localStorage
    this.loadActivityLog();
  }
  
  ngOnInit(): void {
    // Start real-time session timer if user is logged in
    if (this.isLoggedIn()) {
      this.startSessionTimer();
    }
    
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
  
  /** Toggle password visibility between hidden and visible */
  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  /** Check if a form field is invalid and has been touched by user */
  isLoginFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /** Handle login form submission */
  onLogin(): void {
    // Validate form before processing
    if (this.loginForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    const email = this.loginForm.value.email;
    const rememberMeValue = this.loginForm.value.rememberMe || false;
    const date = new Date().toLocaleDateString();
    const timestamp = Date.now();
    
    // Save session data to localStorage
    localStorage.setItem('userEmail', email);
    localStorage.setItem('loginDate', date);
    localStorage.setItem('loginTimestamp', timestamp.toString());
    localStorage.setItem('rememberMe', rememberMeValue.toString());
    
    this.userEmail.set(email);
    this.loginDate.set(date);
    this.loginTimestamp.set(timestamp);
    this.rememberMe.set(rememberMeValue);
    this.isLoggedIn.set(true);
    
    // Add login to activity log
    this.addActivityLogEntry('Logged in', undefined, '🔐');
    
    // Start session timer
    this.startSessionTimer();
    
    // Reset form
    this.loginForm.reset();
    this.showPassword.set(false);
  }

  onLogout(): void {
    // Add logout to activity log before clearing
    this.addActivityLogEntry('Logged out', undefined, '🚪');
    
    this.clearSessionData();
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
  
  private clearSessionData(): void {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('loginDate');
    localStorage.removeItem('loginTimestamp');
    localStorage.removeItem('rememberMe');
    this.isLoggedIn.set(false);
    this.userEmail.set('');
    this.loginDate.set('');
    this.sessionDuration.set('');
    this.rememberMe.set(false);
  }
  
  private addActivityLogEntry(action: string, itemName?: string, icon: string = '📝'): void {
    const entry: ActivityLogEntry = {
      action,
      itemName,
      timestamp: new Date().toLocaleString(),
      icon
    };
    
    const currentLog = this.activityLog();
    const newLog = [entry, ...currentLog].slice(0, 10); // Keep only last 10
    this.activityLog.set(newLog);
    localStorage.setItem('activityLog', JSON.stringify(newLog));
  }
  
  // Public method that can be called from other components
  static logActivity(action: string, itemName?: string, icon: string = '📝'): void {
    const entry: ActivityLogEntry = {
      action,
      itemName,
      timestamp: new Date().toLocaleString(),
      icon
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