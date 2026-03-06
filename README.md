# Inventory Manager App

A multi-page Angular inventory management app built with **Angular 21**, **Tailwind CSS**, and **Server-Side Rendering (SSR)**. Demonstrates full CRUD operations against a public REST API, reactive form validation, typed HTTP service architecture, and responsive UI design.

---

## Prerequisites

- **Node.js** v18+ (required)
- **npm** v11+ (required)
- **Angular CLI** (optional, for `ng` commands)

---

## How to Run

**Install dependencies:**

```bash
npm install
```

**Configure environment** (required):

```bash
cp src/environments/environment.ts src/environments/environment.local.ts
```

Edit `environment.local.ts` and replace `YOUR_API_KEY_HERE` with your actual API key. See [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) for full instructions and troubleshooting.

**Start the development server:**

```bash
npm start
```

Open http://localhost:4200/

---

## Features

- Full CRUD on inventory objects — create, list, view, edit, and delete
- Objects List with a table view and View / Edit / Delete actions per row
- Object Detail page showing all fields, handles `null` data safely
- Validated reactive forms with inline error messages and disabled submit until valid
- Dynamic custom data fields — add unlimited key/value pairs to any object
- Smart field name suggestions loaded from real API data with auto-type detection
- Angular service layer with strongly-typed `HttpClient` calls
- Loading indicators on all async operations
- User-friendly error messages, including detection of reserved API IDs
- Server-Side Rendering via Express with Content Security Policy headers
- Responsive layout with Tailwind CSS
- JWT-based mock authentication with role-aware route guards (`authGuard`, `adminGuard`)
- Role-protected Admin Panel visible only to users with the `admin` role

---

## Authentication & Authorization

The app uses a **mock JWT authentication** system implemented entirely in the browser (no external auth server required). Tokens are stored in `localStorage` and decoded client-side to read the user's email and role.

### Guards

Two `CanActivate` route guards protect navigation:

| Guard | File | Behavior |
|---|---|---|
| `authGuard` | `guards/auth.guard.ts` | Allows only authenticated users. Unauthenticated visitors are redirected to `/auth/login`, with the original destination preserved as a `returnUrl` query parameter. |
| `adminGuard` | `guards/admin.guard.ts` | Allows only users whose JWT role claim is `'admin'`. Non-admin users are redirected to `/`. Always composed after `authGuard`. |

### Protected Routes

| Route | Guard(s) |
|---|---|
| `/products/create` | `authGuard` + `adminGuard` |
| `/products/:id/edit` | `authGuard` + `adminGuard` |
| `/account` | `authGuard` |
| `/admin` | `authGuard` + `adminGuard` |

Public routes (`/`, `/products`, `/products/:id`, `/auth/login`, `/auth/register`, and the `**` 404 catch-all) require no authentication. Anyone can browse the inventory; only admins can create, edit, or delete items.

### Navbar Role Awareness

The navbar also conditionally renders links based on auth state — the **Inventory**, **Add Item**, **Account**, and **Logout** links are hidden when logged out, and the **Admin Panel** link is hidden unless the current user's role is `'admin'`. This is a UI convenience only; the guards are the authoritative enforcement layer.

### Logout

`AuthService.logout()` clears the token from both memory and `localStorage`, then navigates to `/auth/login` (not the home page).

---

## Public API

Base URL: https://api.restful-api.dev/objects

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/objects` | Retrieve all objects |
| GET | `/objects/{id}` | Retrieve a single object |
| POST | `/objects` | Create a new object |
| PUT | `/objects/{id}` | Full update |
| PATCH | `/objects/{id}` | Partial update |
| DELETE | `/objects/{id}` | Delete an object |

**Data model:**

```typescript
interface ApiObject {
  id?: string;
  name: string;
  data?: {
    color?: string;
    price?: number;
    [key: string]: unknown;
  } | null;
}
```

## Authentication Flow

Authentication uses a **mock backend** running entirely inside Angular — no real server is involved.

1. **Register** (`/register`) — creates an account in the in-memory user store; password is hashed before storage; the `user` role is assigned by default
2. **Login** (`/login`) — checks credentials against the store; on success a mock JWT is issued and saved to `localStorage`
3. **Session persistence** — on page refresh, `AuthService` reads the token from `localStorage` and validates its expiry; expired tokens are discarded automatically
4. **Logout** — clears the token from memory and `localStorage`, then redirects to `/login`
5. **Guards** — `authGuard` blocks unauthenticated access; `adminGuard` additionally checks the role claim in the token

**Test credentials (pre-seeded, survives page refresh):**
- Admin: `admin@example.com` / `Admin1234!`
- Any new account registered via `/register` gets the `user` role

> **Note:** Object IDs 1–13 are reserved demo objects provided by the API and cannot be edited or deleted. Create a new object to test edit and delete functionality.

---

## Pages and Routes

### Home / Dashboard (`/`)
Welcome page with navigation links and a live count of objects loaded from the API. No authentication required.

### Login (`/auth/login`) · Register (`/auth/register`)
Credential forms backed by `MockAuthService`. On success a JWT is stored in `localStorage` and the user is redirected to their original destination (or home). No authentication required.

### Inventory List (`/products`) · public
Displays all inventory items in a responsive table. Anyone can browse. **Edit** and **Delete** actions are visible only to admins.

### Item Detail (`/products/:id`) · public
Shows a single object and all of its `data` fields. Handles `null` data gracefully. Edit, Delete, and Quick Rename shortcuts are visible only to admins.

### Create Item (`/products/create`) · `authGuard` + `adminGuard`
Validated form for creating a new item. Requires a name (min 3 characters), accepts optional color and price fields, and supports unlimited additional custom key/value fields. Redirects to the detail page on success. Admin only.

### Edit Item (`/products/:id/edit`) · `authGuard` + `adminGuard`
Pre-populated form for updating an existing item using PUT (full replacement). Preserves custom fields that exist on the object. Shows a clear error if the object is a reserved ID. Admin only.

### Account (`/account`) · `authGuard`
Displays the current user's email, role, and account actions. Requires a valid session.

### Admin Panel (`/admin`) · `authGuard` + `adminGuard`
Admin-only dashboard showing system stats and quick-action links. Accessible only to users with the `admin` role; all others are redirected to home.

### Not Found (wildcard)
Custom 404 page rendered for any unmatched route, with links back to Home and the Inventory List. No authentication required.

---

## Testing

Unit tests run with:

```bash
npm test
```

See [TESTING.md](TESTING.md) for the full test plan, manual test scenarios, browser DevTools debugging guide, and API integration verification steps.

---

## Project Structure

```
src/
├── app/
│   ├── pages/
│   │   ├── home/                    # Dashboard/Home page
│   │   ├── products/
│   │   │   ├── list/                # Objects list table
│   │   │   ├── detail/              # Single object view
│   │   │   ├── create/              # Create form
│   │   │   └── edit/                # Edit form
│   │   ├── account/                 # Login/account page
│   │   └── admin/                   # Admin area
│   ├── shared/components/
│   │   ├── navbar/                  # Global navigation
│   │   ├── footer/                  # Global footer
│   │   └── not-found/               # 404 page
│   ├── forms/                       # Form config, field definitions, dynamic form component
│   ├── services/                    # ObjectsService, AuthService
│   ├── models/                      # TypeScript interfaces
│   ├── guards/                      # Route guards
│   ├── app.routes.ts                # Client-side routes
│   └── app.routes.server.ts         # Server-side routes (SSR)
├── environments/
│   ├── environment.ts               # Template (committed)
│   └── environment.local.ts         # Local config with API key (gitignored)
├── server.ts                        # Express SSR server and CSP
└── index.html                       # App shell
```

**Structure Benefits:** Clear separation by feature and layer, easy navigation, scalable, follows standard Angular project conventions

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the development server |
| `npm test` | Run unit tests (see [TESTING.md](TESTING.md)) |
| `npm run build` | Production build |

---

## Additional Documentation

- **[ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)**: API key setup, environment file configuration, and troubleshooting steps
- **[TESTING.md](TESTING.md)**: Manual test scenarios, debugging tips, and unit test guidance
