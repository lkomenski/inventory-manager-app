// ─────────────────────────────────────────────────────────────────────────────
// user.model.ts
//
// All the TypeScript shapes (interfaces / types) used across the auth feature.
// Keeping them in one file makes it easy to find and understand the data
// structures without digging through multiple services.
// ─────────────────────────────────────────────────────────────────────────────

/** The two roles a user can have. */
export type UserRole = 'user' | 'admin';

/**
 * What we actually save in the in-memory "database" inside MockAuthService.
 * We NEVER send the passwordHash to the browser outside of that service.
 */
export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string; // hashed – plaintext is never stored
  role: UserRole;
}

/**
 * A safe, public view of a user – no password hash.
 * This is what components and templates can see.
 */
export interface PublicUser {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * The data we encode inside the mock JWT token.
 * A real JWT would have the same fields (plus more security).
 */
export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  /** Unix timestamp (seconds) when the token expires. */
  exp: number;
}

/**
 * What register() and login() return when they succeed.
 * The token goes to localStorage; the user object can be shown in the UI.
 */
export interface AuthResult {
  token: string;
  user: PublicUser;
}