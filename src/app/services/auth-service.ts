// ─────────────────────────────────────────────────────────────────────────────
// auth.service.ts
//
// AuthService is the single source of truth for the current session.
// Components and guards talk to AuthService; AuthService talks to MockAuthService.
//
// Responsibilities:
//   • login()       – ask MockAuthService to verify credentials, save the token
//   • register()    – ask MockAuthService to create an account, save the token
//   • logout()      – clear the token and send the user to /login
//   • getToken()    – return the raw JWT string (or null)
//   • isLoggedIn()  – true when a valid, non-expired token is present
//   • getRole()     – read the role ('user' | 'admin') from the token
//   • currentUser() – full decoded user info from the token
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable, PLATFORM_ID, inject, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MockAuthService } from './mock-auth-service';
import { PublicUser, UserRole } from '../models/user-model';

// The key we'll use when reading/writing to localStorage
const TOKEN_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {

  // Angular's dependency injection – we ask for these services by type
  private mockAuth = inject(MockAuthService);
  private router   = inject(Router);
  private platform = inject(PLATFORM_ID); // tells us if we're in browser or SSR

  // ── Reactive state (Angular Signals) ───────────────────────────────────────
  //
  // `signal` is Angular's reactive variable.  When its value changes, any
  // template or `computed` that reads it will automatically update.

  /** The raw JWT string. null = not logged in. */
  readonly token = signal<string | null>(this.loadStoredToken());

  /**
   * Derived from `token`: decode it and return the user info, or null.
   * `computed` re-runs automatically whenever `token` changes.
   */
  readonly currentUser = computed<PublicUser | null>(() => {
    const t = this.token();
    if (!t) return null;

    const payload = this.mockAuth.decodeToken(t);
    if (!payload) return null; // expired or malformed

    return { id: payload.id, email: payload.email, role: payload.role };
  });

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * register()
   *
   * Delegates to MockAuthService, then stores the token.
   * Throws when the email is already taken (the error bubbles up to the form).
   */
  register(email: string, password: string): void {
    const result = this.mockAuth.register(email, password);
    this.saveToken(result.token);
  }

  /**
   * login()
   *
   * Delegates to MockAuthService, then stores the token.
   * Throws when credentials are wrong (the error bubbles up to the form).
   */
  login(email: string, password: string): void {
    const result = this.mockAuth.login(email, password);
    this.saveToken(result.token);
  }

  /**
   * logout()
   *
   * Clears the token from memory and localStorage, then redirects to /login.
   */
  logout(): void {
    this.token.set(null);
    if (isPlatformBrowser(this.platform)) {
      localStorage.removeItem(TOKEN_KEY);
    }
    this.router.navigate(['/login']);
  }

  /**
   * getToken()
   *
   * Returns the raw JWT string, or null if the user is not logged in.
   * Guards and interceptors use this.
   */
  getToken(): string | null {
    return this.token();
  }

  /**
   * isLoggedIn()
   *
   * Returns true when there is a valid, non-expired token.
   * Can be called from templates or guards.
   */
  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  /**
   * getRole()
   *
   * Reads the role field from the decoded token.
   * Returns null if nobody is logged in.
   */
  getRole(): UserRole | null {
    return this.currentUser()?.role ?? null;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /** Save a new token both in the signal and in localStorage. */
  private saveToken(t: string): void {
    this.token.set(t);
    if (isPlatformBrowser(this.platform)) {
      localStorage.setItem(TOKEN_KEY, t);
    }
  }

  /**
   * Called once at startup to rehydrate a session from localStorage.
   * If the stored token is expired we discard it immediately.
   */
  private loadStoredToken(): string | null {
    if (!isPlatformBrowser(this.platform)) return null; // SSR safety

    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) return null;

    // Validate the token before trusting it
    const payload = this.mockAuth.decodeToken(stored);
    if (!payload) {
      localStorage.removeItem(TOKEN_KEY); // clean up expired token
      return null;
    }

    return stored;
  }
}