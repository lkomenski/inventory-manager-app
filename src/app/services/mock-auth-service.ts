// ─────────────────────────────────────────────────────────────────────────────
// mock-auth.service.ts
//
// This service pretends to be a back-end authentication server.
// Everything runs in memory – no real HTTP calls, no real crypto.
//
// What it does:
//   • Keeps an in-memory list of users (like a database table).
//   • Hashes passwords with a simple algorithm before storing them.
//   • On login, hashes the submitted password and compares it to what's stored.
//   • Builds a mock JWT token so other parts of the app can read user info
//     without calling a real server.
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable } from '@angular/core';
import { AuthResult, StoredUser, TokenPayload, UserRole } from '../models/user-model';

@Injectable({ providedIn: 'root' })
export class MockAuthService {

  // ── "Database" ─────────────────────────────────────────────────────────────
  //
  // A plain JavaScript array acts as our in-memory user table.
  // It resets every time the page is refreshed (that's fine for this exercise).
  //
  // We pre-seed one admin account so you can test admin-only features straight
  // away without going through the register form.

  private users: StoredUser[] = [
    {
      id: this.makeId(),
      email: 'admin@example.com',
      passwordHash: this.hashPassword('Admin1234!'), // hash stored, not plaintext
      role: 'admin',
    },
  ];

  // ── Public methods (the "API endpoints") ───────────────────────────────────

  /**
   * register()
   *
   * Saves a new user to the in-memory array.
   * Throws a plain Error if the email is already taken.
   *
   * @param email    The user's email address.
   * @param password The plaintext password typed into the form.
   * @param role     Defaults to 'user'; pass 'admin' if needed.
   */
  register(email: string, password: string, role: UserRole = 'user'): AuthResult {
    // Check for duplicate email (case-insensitive)
    if (this.findByEmail(email)) {
      throw new Error('An account with this email already exists.');
    }

    // Build the stored user – notice we hash the password immediately
    const newUser: StoredUser = {
      id: this.makeId(),
      email: email.toLowerCase().trim(),
      passwordHash: this.hashPassword(password),
      role,
    };

    this.users.push(newUser); // "INSERT INTO users …"

    // Return a token + safe user info so the caller can log the user in
    return this.buildAuthResult(newUser);
  }

  /**
   * login()
   *
   * Looks up the user by email, then compares the hashed passwords.
   * Throws a plain Error when credentials are wrong.
   *
   * @param email    Email typed in the login form.
   * @param password Plaintext password typed in the login form.
   */
  login(email: string, password: string): AuthResult {
    const user = this.findByEmail(email);

    // We hash the submitted password and compare – we never unhash the stored one
    const isPasswordCorrect = user?.passwordHash === this.hashPassword(password);

    if (!user || !isPasswordCorrect) {
      // Generic message on purpose – don't reveal whether the email exists
      throw new Error('Invalid email or password.');
    }

    return this.buildAuthResult(user);
  }

  /**
   * decodeToken()
   *
   * Reads a mock JWT and returns the payload object, or null when the token is
   * missing, malformed, or past its expiry date.
   *
   * @param token  The JWT string from localStorage.
   */
  decodeToken(token: string): TokenPayload | null {
    try {
      // A JWT has three base-64 parts separated by dots: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload: TokenPayload = JSON.parse(atob(parts[1]));

      // Reject tokens that have expired (exp is in seconds, Date.now() in ms)
      const nowInSeconds = Date.now() / 1000;
      if (nowInSeconds > payload.exp) return null;

      return payload;
    } catch {
      // If anything goes wrong while parsing, treat the token as invalid
      return null;
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /** Find a user by email (case-insensitive). Returns undefined if not found. */
  private findByEmail(email: string): StoredUser | undefined {
    return this.users.find(u => u.email === email.toLowerCase().trim());
  }

  /**
   * Build an AuthResult from a StoredUser.
   * Creates the token and strips the password hash before returning.
   */
  private buildAuthResult(user: StoredUser): AuthResult {
    // Build the token payload – this is the data other parts of the app can read
    const payload: TokenPayload = {
      id:    user.id,
      email: user.email,
      role:  user.role,
      exp:   Math.floor(Date.now() / 1000) + 60 * 60 * 8, // expires in 8 hours
    };

    return {
      token: this.createMockJWT(payload),
      // Expose only safe fields – no passwordHash
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  /**
   * createMockJWT()
   *
   * Produces a string shaped like a real JWT:  base64(header).base64(payload).base64(sig)
   *
   * The "signature" part is NOT cryptographically valid – it's just there to
   * make the string look like a real JWT. For a real app you'd verify the
   * signature on the server; here we just skip that part.
   */
  private createMockJWT(payload: TokenPayload): string {
    const header    = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body      = btoa(JSON.stringify(payload));
    const signature = btoa(`mock-sig:${payload.id}`); // not real crypto
    return `${header}.${body}.${signature}`;
  }

  /**
   * hashPassword()
   *
   * A deterministic, non-cryptographic hash (djb2 variant).
   * It is NOT secure for production use, but it shows the concept:
   * the same password always produces the same hash, and you can't
   * easily reverse a hash to get the original password.
   */
  private hashPassword(password: string): string {
    let hash = 5381;
    for (let i = 0; i < password.length; i++) {
      // Multiply the running hash by 33, then XOR with the current character code
      hash = Math.imul(hash, 33) ^ password.charCodeAt(i);
    }
    // Convert to an unsigned 32-bit hex string so the result is always positive
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  /** Generate a short unique ID for each new user. */
  private makeId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
}