# Testing Guide

This document provides test cases for the Inventory Manager Application to verify all features work correctly against the API requirements.

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

Test that all API endpoints work correctly and return expected outputs matching the [restful-api.dev](https://restful-api.dev/) documentation.

### 1. GET All Objects
**Endpoint**: `GET /objects`  
**Steps**: Navigate to http://localhost:4200/products  
**Expected Output**:
```json
[
  {
    "id": "1",
    "name": "Google Pixel 6 Pro",
    "data": {
      "color": "Cloudy White",
      "capacity": "128 GB"
    }
  },
  ...
]
```
**Verification**: Objects display in table with ID, name, and action buttons

### 2. GET Single Object
**Endpoint**: `GET /objects/:id`  
**Steps**: Click "View" on any object  
**Expected Output**:
```json
{
  "id": "7",
  "name": "Apple MacBook Pro 16",
  "data": {
    "year": 2019,
    "price": 1849.99,
    "CPU model": "Intel Core i9",
    "Hard disk size": "1 TB"
  }
}
```
**Verification**: Detail page shows ID, name, and all data fields

### 3. GET Objects by IDs (Query Parameters)
**Endpoint**: `GET /objects?id=3&id=5&id=10`  
**Steps**: Navigate to http://localhost:4200/products?id=3&id=5&id=10  
**Expected Output**: Array containing only objects with IDs 3, 5, and 10  
**Verification**: 
- Blue "Filtered View" banner appears
- Only requested objects display
- "View All" link clears filter

### 4. POST Create Object
**Endpoint**: `POST /objects`  
**Steps**: 
1. Navigate to http://localhost:4200/products/create
2. Fill in name: "Apple MacBook Pro 16"
3. Add data fields: year=2019, price=2049.99
4. Click "Create Object"

**Expected Output**:
```json
{
  "id": "ff80818190e3ca740190e3ca745e0003",
  "name": "Apple MacBook Pro 16",
  "createdAt": "2024-02-19T10:00:00.000+00:00",
  "data": {
    "year": 2019,
    "price": 2049.99
  }
}
```
**Verification**: 
- Success message appears
- Redirects to detail page after 1 second
- New object displays correctly

### 5. PUT Update Object (Full)
**Endpoint**: `PUT /objects/:id`  
**Steps**: 
1. Create a new object first
2. Click "Edit" on that object
3. Modify name and data fields
4. Click "Update Object"

**Expected Output**: Updated object with all fields replaced  
**Verification**: 
- Success message appears
- Redirects to detail page
- Changes are saved and visible

### 6. DELETE Object
**Endpoint**: `DELETE /objects/:id`  
**Steps**: 
1. Create a new object
2. Click "Delete" button
3. Confirm in modal dialog

**Expected Output**:
```json
{
  "message": "Object with id = 6, has been deleted."
}
```
**Verification**: 
- Confirmation modal appears
- After deletion, redirects to list page
- Object no longer appears in list

---

## Feature Tests

### Authentication
**Test**: Navigate to http://localhost:4200/auth/login  
**Expected**:
- Login form with email and password fields
- Invalid credentials show an inline error message
- Valid credentials store a JWT in `localStorage` and redirect to home
- Register form at http://localhost:4200/auth/register creates a new account

**Test**: Access a protected route while logged out (e.g. http://localhost:4200/products)  
**Expected**:
- Redirected to `/auth/login?returnUrl=%2Fproducts`
- After login, redirected back to the originally requested page

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
- Overview section shows: Total Items, Last Updated timestamp, API Status, API connection status
- API Status shows "Connected" (green) or "Disconnected" (red) based on connection
- API Limit shows "Active" or rate limit info if available
- Quick action cards for: View All Items, Add New Item, My Account, API Information

### List View Features
**Test**: Navigate to http://localhost:4200/products  
**Expected**:
- All objects load and display in table
- Search box filters objects by name (case-insensitive)
- Sort A-Z / Z-A buttons reorder list
- Pagination shows 5 items per page
- View/Edit/Delete buttons work for each object

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
- Navbar links work for authenticated users: Home, Inventory, Add Item, Account, Logout
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
- [ ] All 6 API endpoints work correctly (GET all, GET by ID, GET by IDs, POST, PUT, DELETE)
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
- [ ] Query parameter filtering
- [ ] Form validation
- [ ] Dynamic API status display
- [ ] Rate limit handling
- [ ] Responsive design (test on mobile/tablet)
