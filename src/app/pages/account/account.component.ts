import { Component, signal, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface ActivityLogEntry {
  action: string;
  itemName?: string;
  timestamp: string;
  icon: string;
}

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
  
  private timerInterval?: number;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });

    // Check if already logged in
    const savedEmail = localStorage.getItem('userEmail');
    const savedDate = localStorage.getItem('loginDate');
    const savedTimestamp = localStorage.getItem('loginTimestamp');
    const savedRememberMe = localStorage.getItem('rememberMe');
    
    if (savedEmail) {
      // Check if session is still valid
      const isRemembered = savedRememberMe === 'true';
      const sessionAge = Date.now() - parseInt(savedTimestamp || '0', 10);
      const maxAge = isRemembered ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days if remembered, 1 day otherwise
      
      if (sessionAge < maxAge) {
        this.isLoggedIn.set(true);
        this.userEmail.set(savedEmail);
        this.loginDate.set(savedDate || new Date().toLocaleDateString());
        this.loginTimestamp.set(parseInt(savedTimestamp || '0', 10));
        this.rememberMe.set(isRemembered);
      } else {
        // Session expired, clear data
        this.clearSessionData();
      }
    }
    
    // Load activity log
    this.loadActivityLog();
  }
  
  ngOnInit(): void {
    // Start session timer if logged in
    if (this.isLoggedIn()) {
      this.startSessionTimer();
    }
    
    // Listen for storage events from other components
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }
  
  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
  }
  
  private handleStorageChange(event: StorageEvent): void {
    if (event.key === 'activityLog') {
      this.loadActivityLog();
    }
  }
  
  private startSessionTimer(): void {
    this.updateSessionDuration();
    this.timerInterval = window.setInterval(() => {
      this.updateSessionDuration();
    }, 1000);
  }
  
  private updateSessionDuration(): void {
    const elapsed = Date.now() - this.loginTimestamp();
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
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
  
  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  isLoginFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    const email = this.loginForm.value.email;
    const rememberMeValue = this.loginForm.value.rememberMe || false;
    const date = new Date().toLocaleDateString();
    const timestamp = Date.now();
    
    // Save to localStorage (simple demo)
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