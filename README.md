# Inventory Manager App

A modern, full-featured inventory management web application built with Angular 21 and Tailwind CSS. This application demonstrates complete CRUD operations using the RESTful API from [restful-api.dev](https://restful-api.dev).

## Project Overview

This project was created as a final project demonstrating:
- Full CRUD operations (Create, Read, Update, Delete) with a public REST API
- Form validation with user-friendly error messages
- Multi-page routing with Angular Router
- Modern Angular standalone components (Angular 21)
- Responsive design with Tailwind CSS
- Loading states and error handling
- TypeScript with strong typing
- RESTful API integration

## Features

### Pages & Routes
- **Home/Dashboard** (\`/\`) - Welcome page with quick stats and navigation
- **Inventory List** (\`/objects\`) - View all items in a table with actions
- **Item Details** (\`/objects/:id\`) - Detailed view of a single item
- **Create Item** (\`/objects/create\`) - Form to add new items with validation
- **Edit Item** (\`/objects/:id/edit\`) - Form to update existing items
- **Account** (\`/account\`) - Simple login/account management demo
- **404 Not Found** (\`/404\`) - Custom error page for invalid routes

### Core Functionality
- **List View**: Display all inventory items in a responsive table
- **Detail View**: View complete information about a single item
- **Create**: Add new items with validated forms (name, color, price)
- **Edit**: Update existing items (PUT/PATCH support)
- **Delete**: Remove items with confirmation modal
- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Mobile-friendly interface

### Form Validation
- Name field: Required, minimum 3 characters
- Color field: Required, color picker with hex value
- Price field: Required, must be >= 0
- Real-time validation feedback
- Submit button disabled until form is valid

## Technology Stack

- **Framework**: Angular 21.1.0
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS 4.1
- **HTTP Client**: Angular HttpClient
- **Router**: Angular Router
- **Forms**: Reactive Forms
- **API**: RESTful API (https://api.restful-api.dev/objects)
- **Build Tool**: Angular CLI

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

\`\`\`
src/
├── app/
│   ├── components/
│   │   ├── home/                  # Dashboard/Home page
│   │   ├── objects-list/          # List of all items
│   │   ├── object-detail/         # Single item details
│   │   ├── create-object/         # Create new item form
│   │   ├── edit-object/           # Edit item form
│   │   ├── account/               # Login/Account page
│   │   ├── not-found/             # 404 error page
│   │   ├── navbar/                # Navigation component
│   │   └── footer/                # Footer component
│   ├── models/
│   │   └── object.model.ts        # TypeScript interfaces
│   ├── services/
│   │   └── objects.service.ts     # API service with HTTP methods
│   ├── app.routes.ts              # Route configuration
│   ├── app.config.ts              # App configuration
│   ├── app.ts                     # Root component
│   └── app.html                   # Root template
├── styles.css                     # Global styles with Tailwind
└── index.html                     # Main HTML file
\`\`\`

## API Integration

This application integrates with the RESTful API at \`https://api.restful-api.dev/objects\`

### API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | \`/objects\` | Retrieve all objects |
| GET | \`/objects/{id}\` | Retrieve single object |
| POST | \`/objects\` | Create new object |
| PUT | \`/objects/{id}\` | Update object (full) |
| PATCH | \`/objects/{id}\` | Update object (partial) |
| DELETE | \`/objects/{id}\` | Delete object |

### Data Model

\`\`\`typescript
interface ApiObject {
  id?: string;
  name: string;
  data?: {
    color?: string;
    price?: number;
    [key: string]: any;
  } | null;
}
\`\`\`

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
\`\`\`bash
npm run build
# or
ng build
\`\`\`

The build artifacts will be stored in the \`dist/\` directory.

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
- Signals for reactive state management
- Reactive forms with validation
- Route protection and navigation
- Service-based architecture
- Strongly-typed TypeScript interfaces
- HTTP client with error handling
- Lazy loading ready structure

### User Experience
- Loading indicators during API calls
- Error messages with retry options
- Form validation with helpful messages
- Confirmation modals for destructive actions
- Responsive mobile-friendly design
- Intuitive navigation
- Visual feedback for user actions

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

---

**Note**: This application uses a public API for demonstration purposes. Data may be modified or deleted by other users.
