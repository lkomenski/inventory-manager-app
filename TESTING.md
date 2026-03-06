# Testing Guide

This document provides manual test cases for the Inventory Manager Application covering all API endpoints, authentication flows, form validation, and UI behaviour.

## Quick Start

1. Start the development server: `npm start`
2. Open http://localhost:4200 in your browser
3. Open Browser DevTools (F12) — use the **Sources** tab to set breakpoints and the **Console** tab to inspect values at runtime

---

## Debugging Guide

Key locations are marked with `// DEBUGGING BREAKPOINT` comments in the source. Set a browser breakpoint on or just after these lines in Chrome DevTools (**Sources → Ctrl+P → open the file → click the gutter**) to pause execution and inspect live values.

### `src/app/services/auth-service.ts`

| Method | What to inspect |
|---|---|
| `logout()` | `this.token()` and `localStorage.getItem('auth_token')` — confirm session exists before cleanup, then step over to verify both are `null` and navigation to `/auth/login` fires |

### `src/app/services/objects.service.ts`

| Location | What to inspect |
|---|---|
| `getObjects()` — tap callback | `response.body` (full objects array) and `response.headers` (rate-limit values) |
| `createObject()` — tap callback | `createdObject.id` — the API-assigned ID used for the post-create redirect |
| `deleteObject()` — tap callback | `response.message` — confirms the API acknowledged the deletion |
| `handleError()` — top of method | `error.status`, `error.url`, `error.error` — determine whether the failure is a network issue, 4xx/5xx, or rate-limit before the switch block categorises it |

### `src/app/pages/products/list/list.component.ts`

| Location | What to inspect |
|---|---|
| `loadObjects()` — next callback | `this.objects` — total count and shape of each `ApiObject` after the API call |
| `filteredItems` getter — before `return` | `result` — verify search filter and sort direction are producing the expected subset before pagination slices it |

### `src/app/pages/products/detail/detail.component.ts`

| Location | What to inspect |
|---|---|
| `loadProduct()` — next callback | `data` — confirm `id`, `name`, and all `data` fields before they are written to the signal |
| `deleteProduct()` — next callback | Reaching this callback at all confirms a successful delete; if the component doesn't navigate away, check whether the service error signal was set instead |

### `src/app/pages/products/create/create.component.ts`

| Location | What to inspect |
|---|---|
| Before `createObject()` call | `newObject` — confirm `name`, `color`, `price`, and custom fields are mapped correctly before the POST is sent |
| `createObject()` — next callback | `created.id` — must be truthy for the redirect to the detail page to succeed |

### `src/app/pages/products/edit/edit.component.ts`

| Location | What to inspect |
|---|---|
| `loadProduct()` — next callback | `this.formConfig.initialData` — verify all existing field values are present so the form pre-populates correctly |
| Before `updateObject()` call | `updatedObject` and `this.objectId()` — confirm the correct ID is targeted and all modified fields are included in the PUT payload |

---

## API Integration Tests

### 1. GET All Objects
**Endpoint**: `GET /objects`
**Steps**: Navigate to http://localhost:4200/products
**Expected Output**:
```json
[
  { "id": "1", "name": "Google Pixel 6 Pro", "data": { ... } },
  ...
]
```
Objects display in a list; click any item row to navigate to its detail page.

---

### 2. GET Single Object

**Endpoint:** `GET /objects/{id}`
**Steps:** Click on any object in the list

**Expected:**
```json
{
  "id": "7",
  "name": "Apple MacBook Pro 16",
  "data": { "year": 2019, "price": 1849.99, "CPU model": "Intel Core i9" }
}
```
Detail page shows the object name as the page heading, plus ID and all data fields.

---

### 3. POST Create Object
**Endpoint**: `POST /objects`  
**Steps**: 
1. Navigate to http://localhost:4200/products/create
2. Fill in name: "Apple MacBook Pro 16"
3. Add data fields: year=2019, price=2049.99
4. Click "Create Object"

**Expected:**
```json
{
  "id": "ff80818190e3...",
  "name": "Test Laptop",
  "createdAt": "...",
  "data": { "color": "#...", "price": 999 }
}
```
- Success message appears
- Redirected to the new item's detail page after ~1 second

---

### 4. PUT — Full Update

**Endpoint:** `PUT /objects/{id}`
**Steps:**
1. Open the detail page for an object you created (not IDs 1–13)
2. Click **Edit Object**
3. Change the name and/or any data field
4. Click **Update Item**

**Expected:**
- The entire object is replaced with the new values
- Redirected to the detail page showing the updated data

---

### 5. PATCH — Quick Rename (Partial Update)

**Endpoint:** `PATCH /objects/{id}`
**Steps:**
1. Open any item's detail page (for a non-reserved object)
2. Find the **Quick Rename** section
3. Type a new name (min 3 characters) in the input
4. Click **Rename (PATCH)**

**Expected:**
```json
{
  "id": "...",
  "name": "<your new name>",
  "data": { /* unchanged */ },
  "updatedAt": "..."
}
```
**Verification**:
- Name updates immediately on the detail page
- All other fields (`data`, etc.) remain unchanged
- Success message appears briefly

### 6. DELETE — Delete Object

**Endpoint:** `DELETE /objects/{id}`
**Steps:**
1. Open the detail page for an object you created (not IDs 1–13)
2. Click **Delete**
3. Confirm in the modal

**Expected:**
- Confirmation modal appears before deletion
- Object is removed from the API
- Redirected to the inventory list
- Object no longer appears in the list
- Attempting to delete a reserved object (IDs 1–13) shows a clear error message

---

## Feature Tests

### Authentication
**Test**: Navigate to http://localhost:4200/auth/login  
**Expected**:
- Login form with email and password fields
- Invalid credentials show an inline error message
- Valid credentials store a JWT in `localStorage` and redirect to home
- Register form at http://localhost:4200/auth/register creates a new account

**Test**: Access a protected route while logged out (e.g. http://localhost:4200/account)
**Expected**:
- Redirected to `/auth/login?returnUrl=%2Faccount`
- After login, redirected back to the originally requested page

**Note**: `/products` and `/products/:id` are public — no login required to browse the inventory.

**Test**: Log in as a non-admin user and navigate to http://localhost:4200/admin  
**Expected**:
- Redirected to `/` (home page)
- Admin Panel link does not appear in the navbar

**Test**: Log in as an admin user  
**Expected**:
- Admin Panel link appears in the navbar
- http://localhost:4200/admin loads successfully
- Logout clears the session and redirects to `/auth/login`

### Home Page
**Test**: Navigate to http://localhost:4200
**Expected**:
- Overview section shows: Total Items, Last Updated timestamp, API Calls Today tracker, API connection status
- API Calls Today shows count out of 50 with a color-coded progress bar (green → yellow at 35 → red at 45) and reset countdown
- API connection shows "Connected" (green) or "Disconnected" (red)
- Quick action cards for: View All Items, Add New Item (admin only), My Account, API Information

### List View Features
**Test**: Navigate to http://localhost:4200/products  
**Expected**:
- All objects load and display in a list
- Search box filters objects by name (case-insensitive)
- Sort A-Z / Z-A buttons reorder list
- Pagination shows 5 items per page
- Clicking any item navigates to its detail page

### Detail View
**Test**: View any object  
**Expected**:
- Object name, ID, and all data fields display
- "Edit" button navigates to edit page
- "Delete" button shows confirmation modal
- "Back to List" link returns to objects page

### Create Object
**Test**: Navigate to http://localhost:4200/products/create  
**Expected**:
- Form has name field (required)
- Can add multiple key-value pairs for data
- "Add Field" button adds new data field
- Remove buttons delete individual fields
- Validation prevents submission with empty name
- Success creates object and navigates to detail page

### Edit Object
**Test**: Edit any created object (note: demo objects 1-13 are read-only)  
**Expected**:
- Form pre-fills with existing data
- Can modify name and data fields
- Can add new data fields
- Can remove existing data fields
- Validation prevents empty name
- Success updates object and navigates to detail page
- Error message for read-only demo objects

### Delete Object
**Test**: Delete any created object  
**Expected**:
- Confirmation modal appears
- "Cancel" closes modal without deleting
- "Delete" removes object and redirects to list
- Error message for read-only demo objects (1-13)

### Navigation
**Test**: Click through all navigation links  
**Expected**:
- Navbar links work for unauthenticated users: Home, Login, Register
- Navbar links work for authenticated non-admin users: Home, Inventory, Account, Logout
- Navbar links work for authenticated admin users: Home, Inventory, Add Item, Admin Panel, Logout
- Admin Panel link appears only when logged in as admin
- Back buttons return to previous page
- Logo/brand link returns to home

### Error Handling
**Test**: Trigger various errors  
**Expected Behaviors**:
- Invalid object ID: Shows "Object not found" error
- Network offline: Shows connection error
- Rate limit exceeded: Shows "Daily API request limit reached" message
- Read-only object edit: Shows clear error message about demo objects
- Form validation: Highlights required fields

---

## Test Checklist

### Core Requirements
- [ ] All API endpoints work correctly (GET all, GET by ID, POST, PUT, PATCH, DELETE)
- [ ] API outputs match expected JSON structure from restful-api.dev
- [ ] CRUD operations function properly
- [ ] Navigation between pages works
- [ ] Error handling displays appropriate messages

### Authentication & Authorization
- [ ] Login with valid credentials stores JWT and redirects correctly
- [ ] Login with invalid credentials shows inline error
- [ ] Register creates a new account and logs in
- [ ] Accessing a protected route while logged out redirects to login with `returnUrl`
- [ ] Non-admin user cannot access `/admin` (redirected to home)
- [ ] Admin user can access `/admin` and sees Admin Panel link in navbar
- [ ] Logout clears session and redirects to `/auth/login`
- [ ] Navbar shows correct links for each auth/role state

### Additional Features
- [ ] Search/filter functionality
- [ ] Sorting (A-Z, Z-A)
- [ ] Pagination
- [ ] Form validation
- [ ] Dynamic API status display
- [ ] Rate limit handling
- [ ] Responsive design (test on mobile/tablet)
