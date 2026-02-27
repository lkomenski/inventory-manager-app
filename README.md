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

> **Note:** Object IDs 1–13 are reserved demo objects provided by the API and cannot be edited or deleted. Create a new object to test edit and delete functionality.

---

## Pages and Routes

### Home / Dashboard (`/`)
Welcome page with navigation links and a live count of objects loaded from the API.

### Objects List (`/objects`)
Displays all inventory items in a responsive table. Each row includes **View**, **Edit**, and **Delete** actions. Supports filtered views via query parameters (e.g. `/objects?id=1&id=2`).

### Object Details (`/objects/:id`)
Shows a single object and all of its `data` fields. Handles `null` data gracefully and provides Edit and Delete shortcuts.

### Create Object (`/objects/create`)
Validated form for creating a new item. Requires a name (min 3 characters), accepts optional color and price fields, and supports unlimited additional custom key/value fields. Redirects to the detail page on success.

### Edit Object (`/objects/:id/edit`)
Pre-populated form for updating an existing item using PATCH. Preserves custom fields that exist on the object. Shows a clear error if the object is a reserved ID.

### Account (`/account`)
Simple login and account management area demonstrating a typical web app auth page.

### Not Found (wildcard)
Custom 404 page rendered for any unmatched route, with a link back to the home page.

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
