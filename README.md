# Inventory Manager App

A modern, full-featured inventory management web application built with Angular 21, Server-Side Rendering (SSR), and Tailwind CSS. This application demonstrates complete CRUD operations using the RESTful API from [restful-api.dev](https://restful-api.dev).

## Project Overview

This project was created as a final project demonstrating:
- Full CRUD operations (Create, Read, Update, Delete) with a public REST API
- Server-Side Rendering (SSR) with Angular Universal
- Proxy configuration for CORS handling in development
- Form validation with user-friendly error messages
- Multi-page routing with Angular Router
- Modern Angular standalone components (Angular 21)
- Responsive design with Tailwind CSS
- Content Security Policy (CSP) configuration
- Loading states and error handling
- TypeScript with strong typing
- RESTful API integration

## Features

### Pages & Routes
- **Home/Dashboard** (`/`) - Welcome page with quick stats and navigation
- **Inventory List** (`/objects`) - View all items in a table with actions
- **Item Details** (`/objects/:id`) - Detailed view of a single item
- **Create Item** (`/objects/create`) - Form to add new items with validation
- **Edit Item** (`/objects/:id/edit`) - Form to update existing items
- **Account** (`/account`) - Simple login/account management demo
- **404 Not Found** (wildcard) - Custom error page for invalid routes (returns proper 404 HTTP status)

### Core Functionality
- **List View**: Display all inventory items in a responsive table
- **Detail View**: View complete information about a single item
- **Create**: Add new items with validated forms (name, color, price)
- **Edit**: Update existing items (uses PATCH for partial updates)
- **Delete**: Remove items with confirmation modal
- **Loading States**: Visual feedback during API calls
- **Error Handling**: Context-aware error messages (e.g., detecting reserved IDs)
- **Responsive Design**: Mobile-friendly interface
- **SEO Friendly**: Server-side rendering with proper meta tags and status codes

### Form Validation
- Name field: Required, minimum 3 characters
- Color field: Required, color picker with hex value
- Price field: Required, must be >= 0
- Real-time validation feedback
- Submit button disabled until form is valid

## Technology Stack

- **Framework**: Angular 21.1.0 with Server-Side Rendering (SSR)
- **Server**: Express.js for SSR and CSP headers
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS 4.1
- **HTTP Client**: Angular HttpClient with proxy configuration
- **Router**: Angular Router (client + server routes)
- **Forms**: Reactive Forms with validation
- **API**: RESTful API (https://api.restful-api.dev/objects)
- **Build Tool**: Angular CLI
- **State Management**: Angular Signals

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** (v11 or higher)
- **Angular CLI** (v21 or higher)

## Installation & Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repository-url>
   cd inventory-manager-app
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start the development server**
   \`\`\`bash
   npm start
   # or
   ng serve
   \`\`\`

4. **Open in browser**
   Navigate to \`http://localhost:4200/\`

The application will automatically reload when you make changes to the source code.

## Project Structure

```
inventory-manager-app/
├── src/
│   ├── app/
│   │   ├── features/                    # Feature modules
│   │   │   ├── account/                 # Account feature
│   │   │   │   └── components/
│   │   │   │       └── account/         # Login/Account page
│   │   │   ├── home/                    # Home feature
│   │   │   │   └── components/
│   │   │   │       └── home/            # Dashboard/Home page
│   │   │   └── objects/                 # Objects feature
│   │   │       ├── components/
│   │   │       │   ├── objects-list/    # List of all items
│   │   │       │   ├── object-detail/   # Single item details
│   │   │       │   ├── create-object/   # Create new item form
│   │   │       │   └── edit-object/     # Edit item form
│   │   │       ├── models/
│   │   │       │   └── object.model.ts  # TypeScript interfaces
│   │   │       └── services/
│   │   │           └── objects.service.ts # API service with HTTP methods
│   │   ├── shared/                      # Shared components
│   │   │   └── components/
│   │   │       ├── navbar/              # Navigation component
│   │   │       ├── footer/              # Footer component
│   │   │       └── not-found/           # 404 error page
│   │   ├── app.routes.ts                # Client-side routes
│   │   ├── app.routes.server.ts         # Server-side routes (SSR)
│   │   ├── app.config.ts                # App configuration
│   │   ├── app.config.server.ts         # Server configuration
│   │   ├── app.ts                       # Root component
│   │   └── app.html                     # Root template
│   ├── server.ts                        # Express server for SSR & CSP
│   ├── main.ts                          # Client bootstrap
│   ├── main.server.ts                   # Server bootstrap
│   ├── styles.css                       # Global styles with Tailwind
│   └── index.html                       # Main HTML file
├── proxy.conf.js                        # Proxy configuration for development
├── angular.json                         # Angular CLI configuration
├── tsconfig.json                        # TypeScript configuration
└── package.json                         # Dependencies & scripts
```

## API Integration

This application integrates with the RESTful API at `https://api.restful-api.dev/objects`

### Development Proxy Configuration

To avoid CORS issues during development, the application uses a proxy configuration (`proxy.conf.js`) that forwards all requests from `/api/*` to `https://api.restful-api.dev/*`.

**How it works:**
- Frontend makes requests to `/api/objects/1` (same origin)
- Proxy forwards to `https://api.restful-api.dev/objects/1`
- Browser's CORS restrictions are bypassed

The proxy is automatically used when running `npm start` or `ng serve`.

### API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/objects` | Retrieve all objects |
| GET | `/objects/{id}` | Retrieve single object |
| POST | `/objects` | Create new object |
| PUT | `/objects/{id}` | Update object (full replacement) |
| PATCH | `/objects/{id}` | Update object (partial update) |
| DELETE | `/objects/{id}` | Delete object |

### Important Notes

**Reserved Object IDs**: Object IDs 1-13 are reserved demo objects provided by the API and **cannot be edited or deleted**. When attempting to edit these objects, you'll see a helpful error message directing you to create a new object instead.

To test editing functionality:
1. Create a new object using the "Add New Item" form
2. Use the generated ID to test edit and delete operations

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

## Server-Side Rendering (SSR)

This application uses Angular Universal for Server-Side Rendering, providing:
- Faster initial page load
- Better SEO (search engines can crawl pre-rendered content)
- Improved performance on low-powered devices
- Social media preview support

### Content Security Policy (CSP)

The application implements Content Security Policy headers via the Express server (`src/server.ts`):
- **Development mode**: Allows `unsafe-eval` and `unsafe-inline` for HMR and debugging
- **Production mode**: Stricter CSP for enhanced security
- **Worker support**: Allows web workers with `worker-src 'self' blob:`
- **API connections**: Whitelists `https://api.restful-api.dev`

The CSP configuration automatically adjusts based on the `NODE_ENV` environment variable.

## Styling

The application uses **Tailwind CSS** for styling with:
- Responsive layouts (mobile-first design)
- Modern gradients and shadows
- Consistent color scheme
- Hover states and transitions
- Loading spinners
- Modal dialogs
- Form styling with validation states
- SVG icons for visual elements

## Testing

Run unit tests with:
\`\`\`bash
npm test
\`\`\`

## Building for Production

Create a production build:
```bash
npm run build
# or
ng build
```

The build artifacts will be stored in the `dist/` directory.

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure the development server is running from the project root directory (not the `src/` folder) so the proxy configuration loads correctly.

```bash
# Make sure you're in the project root
cd inventory-manager-app
npm start
```

### Can't Edit Objects
Objects with IDs 1-13 are reserved by the API and cannot be edited. Create a new object to test edit functionality.

### Git Errors with 'nul' File
Windows reserves certain filenames (`nul`, `con`, `prn`, etc.). These are now automatically ignored in `.gitignore`.

### Content Security Policy Violations
CSP warnings in development mode are normal and expected (related to HMR and dev tools). They won't appear in production builds.

## Usage Guide

### Viewing Items
1. Navigate to "Inventory" in the navigation bar
2. Browse the list of items in the table
3. Click "View" to see detailed information
4. Click "Edit" to modify an item
5. Click "Delete" to remove an item (with confirmation)

### Creating an Item
1. Click "Add New Item" from the home page or navigation
2. Fill in the required fields:
   - Name (min 3 characters)
   - Color (use color picker or enter hex value)
   - Price (must be >= 0)
3. Click "Create Item" when form is valid
4. You'll be redirected to the item details page

### Editing an Item
1. Navigate to an item's detail page
2. Click "Edit Object"
3. Modify the fields as needed
4. Click "Update Item" to save changes

### Deleting an Item
1. Click "Delete" on any item
2. Confirm the deletion in the modal
3. Item will be removed from the list

## Key Features Demonstrated

### Angular Best Practices
- Standalone components (latest Angular approach)
- Server-Side Rendering with Angular Universal
- Signals for reactive state management
- Reactive forms with validation
- Route protection and navigation
- Service-based architecture with feature modules
- Strongly-typed TypeScript interfaces
- HTTP client with comprehensive error handling
- Development proxy for CORS handling
- Lazy loading ready structure
- Content Security Policy implementation
- Proper HTTP status codes for SEO

### User Experience
- Loading indicators during API calls
- Smart error messages with context-aware guidance
- Detection of reserved/read-only objects with helpful instructions
- Form validation with helpful messages
- Confirmation modals for destructive actions
- Responsive mobile-friendly design
- Intuitive navigation
- Visual feedback for user actions
- Proper HTTP status codes (404 for not found pages)

## Contributing

This is an academic project, but suggestions are welcome!

## License

This project is for educational purposes.

## Author

Created for Angular Final Project - 2026

## Acknowledgments

- Angular team for the amazing framework
- RESTful API Dev for providing the free API
- Tailwind CSS for the utility-first CSS framework
- Express.js for the SSR server

---

**Note**: This application uses a public API for demonstration purposes. Data may be modified or deleted by other users. Object IDs 1-13 are reserved demo objects and cannot be edited or deleted.
