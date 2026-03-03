# Inventory Manager App

A modern, full-featured inventory management web application built with Angular 21, Server-Side Rendering (SSR), and Tailwind CSS. This application demonstrates complete CRUD operations using the RESTful API from [restful-api.dev](https://restful-api.dev), along with mock JWT authentication and role-based access control.

## Project Overview

This project was created as a final project demonstrating:
- Full CRUD operations (Create, Read, Update, Delete) with a public REST API
- Mock JWT authentication with login, registration, and role-based access
- Route guards protecting authenticated and admin-only pages
- Server-Side Rendering (SSR) with Angular Universal
- Proxy configuration for CORS handling in development
- Form validation with user-friendly error messages
- Multi-page routing with Angular Router
- Modern Angular standalone components (Angular 21)
- Responsive design with Tailwind CSS
- Loading states and error handling
- TypeScript with strong typing
- RESTful API integration

## Features

### Pages & Routes

| Route | Page | Guard |
|-------|------|-------|
| `/` | Home / Dashboard | — |
| `/login` | Login | — |
| `/register` | Register | — |
| `/objects` | Inventory List | — |
| `/objects/:id` | Item Detail | — |
| `/objects/create` | Create Item | Auth required |
| `/objects/:id/edit` | Edit Item | Auth required |
| `/account` | My Account | Auth required |
| `/admin` | Admin Panel | Admin role required |
| `/**` | 404 Not Found | — |

### Authentication & Authorization
- **Login** – email + password form, validated; credentials checked against the mock auth store
- **Register** – email + password + confirmation form with mismatch validation; new accounts get the `user` role
- **Mock JWT** – on login/register, a mock JSON Web Token (header.payload.signature) is issued and stored in `localStorage` under `auth_token`; it expires after 8 hours
- **AuthService** – single source of truth for session state; exposes `isLoggedIn()`, `getRole()`, `currentUser()` (Angular Signal), `login()`, `register()`, `logout()`
- **MockAuthService** – simulates a backend; maintains an in-memory user store, hashes passwords (djb2), issues mock JWTs
- **Route Guards** – `authGuard` redirects unauthenticated users to `/login`; `adminGuard` additionally requires the `admin` role
- **Role-based UI** – navbar shows the Admin link only to users with the `admin` role; Create/Edit links hidden when logged out
- **Pre-seeded admin account**: `admin@example.com` / `Admin1234!`

### Core Inventory Functionality
- **List View** – display all inventory items in a responsive table with search, sort (A–Z / Z–A), and pagination (5 per page)
- **Filtered List** – filter by specific object IDs via query parameters (e.g. `/objects?id=1&id=2`)
- **Detail View** – view complete information for a single item including all data fields
- **Quick Rename (PATCH)** – update only the item name via `PATCH /objects/{id}`; all other data fields stay intact
- **Create** – add new items with the shared validated form (POST)
- **Edit** – update existing items in full via the same shared form (PUT)
- **Delete** – remove items with a confirmation modal
- **Smart Field Suggestions** – dropdown dynamically populated from all field names found in the live API, with auto-type detection
- **Dynamic Custom Fields** – add unlimited key/value data properties with text or number types
- **Activity Log** – the Account page tracks recent creates, edits, renames, and deletes via `localStorage`

### Form Validation
- Name: required, minimum 3 characters
- Price: must be ≥ 0 if provided
- Color: optional color picker (hex)
- Email: required, valid email format
- Password: required, minimum 6 characters
- Password confirmation: must match password (group-level validator)
- Real-time validation messages shown after the field is touched
- Submit button disabled until the form is fully valid

## Technology Stack

- **Framework**: Angular 21.1.0 with Server-Side Rendering (SSR)
- **Server**: Express.js for SSR and CSP headers
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS 4.1 (only — no other CSS framework)
- **HTTP Client**: Angular HttpClient with proxy configuration
- **Router**: Angular Router with functional route guards
- **Forms**: Reactive Forms with synchronous and group-level validators
- **API**: RESTful API (https://api.restful-api.dev/objects)
- **State Management**: Angular Signals
- **Auth**: Mock JWT (in-memory, no real server)

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** (v11 or higher)
- **Angular CLI** (v21 or higher)

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd inventory-manager-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment** (Important!)

   The application requires environment configuration for API access. See [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) for detailed instructions.

   Quick setup:
   ```bash
   # Copy the environment template file
   cp src/environments/environment.ts src/environments/environment.local.ts

   # Edit src/environments/environment.local.ts and replace YOUR_API_KEY_HERE with your actual API key
   ```

   **Note**: The `environment.local.ts` file is gitignored and should never be committed to version control.

4. **Start the development server**
   ```bash
   npm start
   # or
   ng serve
   ```

5. **Open in browser**
   Navigate to `http://localhost:4200/`

The application will automatically reload when you make changes to the source code.

## Project Structure

```
inventory-manager-app/
├── src/
│   ├── app/
│   │   ├── guards/                          # Route guards
│   │   │   ├── auth.guard.ts                # Requires login
│   │   │   └── admin.guard.ts               # Requires admin role
│   │   ├── pages/                           # Page components
│   │   │   ├── auth/
│   │   │   │   ├── login/                   # Login page (/login)
│   │   │   │   └── register/               # Register page (/register)
│   │   │   ├── admin/                       # Admin panel (/admin)
│   │   │   ├── account/                     # Account dashboard (/account)
│   │   │   ├── home/                        # Dashboard (/))
│   │   │   ├── objects-list/                # List of all items (/objects)
│   │   │   ├── object-detail/               # Single item detail (/objects/:id)
│   │   │   ├── object-create/               # Create new item (/objects/create)
│   │   │   └── object-edit/                 # Edit item (/objects/:id/edit)
│   │   ├── forms/                           # Shared form components
│   │   │   ├── dynamic-object-form.component.ts   # Reusable create/edit form
│   │   │   ├── dynamic-object-form.component.html
│   │   │   └── index.ts
│   │   ├── models/
│   │   │   ├── object.model.ts              # API object interfaces
│   │   │   └── user-model.ts               # Auth user interfaces
│   │   ├── services/
│   │   │   ├── objects.service.ts           # Inventory API service
│   │   │   ├── auth-service.ts              # Auth state & session
│   │   │   └── mock-auth-service.ts         # Simulated auth backend
│   │   ├── shared/                          # Shared components
│   │   │   └── components/
│   │   │       ├── navbar/                  # Navigation (auth-aware)
│   │   │       ├── footer/                  # Footer
│   │   │       └── not-found/               # 404 page
│   │   ├── app.routes.ts                    # All client-side routes + guards
│   │   ├── app.config.ts                    # App providers
│   │   ├── app.ts                           # Root component
│   │   └── app.html                         # Root template
│   ├── environments/
│   │   ├── environment.ts                   # Template (committed)
│   │   └── environment.local.ts             # Your real config (gitignored)
│   ├── server.ts                            # Express server (SSR + CSP)
│   ├── main.ts                              # Client bootstrap
│   ├── main.server.ts                       # Server bootstrap
│   └── styles.css                           # Global styles + Tailwind
├── README.md
├── TESTING.md                               # Manual test cases
├── ENVIRONMENT_SETUP.md                     # Environment config guide
├── angular.json
├── tsconfig.json
└── package.json
```

## API Integration

This application integrates with the RESTful API at `https://api.restful-api.dev/objects`

### Development Proxy Configuration

To avoid CORS issues during development, the application uses a proxy configuration (`proxy.conf.js`) that forwards all requests from `/api/*` to `https://api.restful-api.dev/*`.

The proxy is automatically used when running `npm start` or `ng serve`.

### API Endpoints Used

| Method | Endpoint | Purpose | Where Used |
|--------|----------|---------|------------|
| GET | `/objects` | Retrieve all objects | List page, Home stats, form field suggestions |
| GET | `/objects?id=x&id=y` | Retrieve specific objects by IDs | Filtered list view |
| GET | `/objects/{id}` | Retrieve single object | Detail page, Edit page pre-fill |
| POST | `/objects` | Create new object | Create form |
| PUT | `/objects/{id}` | Full replacement update | Edit form |
| PATCH | `/objects/{id}` | Partial update (name only) | Quick Rename on Detail page |
| DELETE | `/objects/{id}` | Delete object | Detail page delete modal |

### Important Notes

**Reserved Object IDs**: Object IDs 1–13 are reserved demo objects provided by the API and **cannot be edited or deleted**. The app detects this and shows a helpful error message.

To test editing/deleting, create a new object first — it will get a unique ID that is fully writable.

### Data Model

```typescript
interface ApiObject {
  id?: string;
  name: string;
  data?: {
    color?: string;
    price?: number;
    [key: string]: any;
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

## Server-Side Rendering (SSR)

This application uses Angular Universal for Server-Side Rendering, providing faster initial page load, better SEO, and improved performance on low-powered devices.

### Content Security Policy (CSP)

CSP headers are set via the Express server (`src/server.ts`). Development mode permits `unsafe-eval` and `unsafe-inline` for HMR; production mode applies stricter settings. The API origin `https://api.restful-api.dev` is explicitly whitelisted.

## Building for Production

```bash
npm run build
# or
ng build
```

Build artifacts are stored in the `dist/` directory.

## Testing

See [TESTING.md](TESTING.md) for complete manual test cases covering:
- All 6 API endpoints (GET, POST, PUT, PATCH, DELETE)
- Authentication flow (login, register, logout, guards, role-based UI)
- Form validation
- Error handling

Run unit tests with:
```bash
npm test
```

## Troubleshooting

**Environment configuration errors** — ensure `environment.local.ts` exists and exports `apiUrl` and `apiKey`. See [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md).

**CORS issues** — run `npm start` from the project root so the proxy configuration loads correctly.

**Can't edit objects** — IDs 1–13 are reserved. Create a new object to test edit/delete.

**Token not persisting** — open DevTools → Application → Local Storage and check for the `auth_token` key.

## License

This project is for educational purposes.

## Author

Created for Angular Final Project — 2026
