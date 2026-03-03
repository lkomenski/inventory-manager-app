# Testing Guide

This document provides manual test cases for the Inventory Manager Application covering all API endpoints, authentication flows, form validation, and UI behaviour.

## Quick Start

1. Start the development server: `npm start`
2. Open `http://localhost:4200` in your browser
3. Open Browser DevTools (F12) → **Console** tab for API log output
4. Open DevTools → **Application** → **Local Storage** to inspect the auth token

---

## Authentication Tests

### 1. Register a New Account

**Steps:**
1. Navigate to `http://localhost:4200/register`
2. Enter any email (e.g. `test@example.com`) and a password of 6+ characters
3. Confirm the password in the second field
4. Click **Create Account**

**Expected:**
- Validation messages appear if fields are empty or the passwords don't match
- The Submit button is disabled while the form is invalid
- On success, you are redirected to the Home page
- The navbar updates to show your email and a **Sign out** button
- DevTools → Local Storage → `auth_token` key is present

---

### 2. Login with the Pre-seeded Admin Account

**Steps:**
1. If logged in, click **Sign out**
2. Navigate to `http://localhost:4200/login`
3. Enter `admin@example.com` / `Admin1234!`
4. Click **Sign In**

**Expected:**
- Redirected to Home page
- Navbar shows the user email and a new **Admin** link
- DevTools → Local Storage → `auth_token` is present

---

### 3. Login with Wrong Credentials

**Steps:**
1. Navigate to `/login`
2. Enter a valid email but a wrong password
3. Click **Sign In**

**Expected:**
- A red error banner appears: *"Invalid email or password."*
- You remain on the login page
- No token is stored

---

### 4. Route Guard — Auth Required

**Steps:**
1. Make sure you are **logged out**
2. Try navigating directly to `http://localhost:4200/account`
3. Try navigating directly to `http://localhost:4200/objects/create`

**Expected:**
- Both redirect to `/login?returnUrl=<original-path>`
- After logging in, you are sent back to the page you originally requested

---

### 5. Route Guard — Admin Required

**Steps:**
1. Register a new account (it gets the `user` role)
2. Try navigating to `http://localhost:4200/admin`

**Expected:**
- Redirected to the Home page (`/`)
- No Admin link visible in the navbar

**Then:**
1. Log out and log in as `admin@example.com` / `Admin1234!`
2. Navigate to `/admin`

**Expected:**
- Admin Panel loads showing the registered users table and inventory count
- The **Admin** link is visible in the navbar

---

### 6. Role-Based UI

**While logged out:**
- Navbar shows **Login** and **Register** buttons
- **Add Item** link is not visible

**While logged in as a regular user:**
- Navbar shows user email, **Sign out**, and **Add Item**
- No **Admin** link

**While logged in as admin:**
- All of the above, plus an **Admin** link in the navbar
- Account page shows an **Admin Panel** button

---

### 7. Logout

**Steps:**
1. Log in as any user
2. Click **Sign out** in the navbar (or from the Account page)

**Expected:**
- Redirected to `/login`
- Navbar reverts to showing **Login** / **Register**
- DevTools → Local Storage → `auth_token` key is removed

---

### 8. Token Persistence Across Refresh

**Steps:**
1. Log in as any user
2. Refresh the page (F5)

**Expected:**
- You remain logged in (navbar still shows your email)
- Token is re-read from `localStorage` and validated on startup

---

### 9. Session Expiry

The mock JWT expires after **8 hours**. To test manually:
1. Open DevTools → Local Storage → `auth_token`
2. Copy the token value, decode the payload (middle segment, base64), find the `exp` field
3. Edit the token to set `exp` to a past Unix timestamp and save it
4. Refresh the page — you should be treated as logged out

---

## API Integration Tests

### 10. GET All Objects

**Endpoint:** `GET /objects`
**Steps:** Navigate to `http://localhost:4200/objects`

**Expected:**
```json
[
  { "id": "1", "name": "Google Pixel 6 Pro", "data": { ... } },
  ...
]
```
Objects display in the table with ID, name, and View / Edit / Delete buttons.

---

### 11. GET Single Object

**Endpoint:** `GET /objects/{id}`
**Steps:** Click **View** on any object in the list

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

### 12. GET Objects by IDs (Query Parameters)

**Endpoint:** `GET /objects?id=3&id=5&id=10`
**Steps:** Navigate to `http://localhost:4200/objects?id=3&id=5&id=10`

**Expected:**
- Only objects with IDs 3, 5, and 10 are shown
- A "Filtered View" banner appears
- **View All** link clears the filter

---

### 13. POST — Create Object

**Endpoint:** `POST /objects`
**Steps:**
1. Log in (Create Item requires authentication)
2. Navigate to `/objects/create`
3. Enter Name: `Test Laptop`, Color: pick any, Price: `999`
4. Click **Create Item**

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
- Activity log on the Account page shows "Created item"

---

### 14. PUT — Full Update

**Endpoint:** `PUT /objects/{id}`
**Steps:**
1. Open the detail page for an object you created (not IDs 1–13)
2. Click **Edit Object**
3. Change the name and/or any data field
4. Click **Update Item**

**Expected:**
- The entire object is replaced with the new values
- Redirected to the detail page showing the updated data
- Activity log on the Account page shows the edit

---

### 15. PATCH — Quick Rename (Partial Update)

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
- Green success banner: *"Item renamed successfully via PATCH."*
- The `<h1>` at the top of the page updates to the new name
- All data fields remain untouched
- Only the name field was sent in the request body

---

### 16. DELETE — Remove Object

**Endpoint:** `DELETE /objects/{id}`
**Steps:**
1. Open the detail page for an object you created
2. Click **Delete Object**
3. Confirm in the modal

**Expected:**
```json
{ "message": "Object with id = ..., has been deleted." }
```
- Modal closes, redirected to the list page
- Object no longer appears in the list

---

## Form Validation Tests

### 17. Create/Edit Form Validation

**Steps:** Go to `/objects/create` and try submitting an empty form

| Field | Rule | Error message |
|-------|------|---------------|
| Name | Required | "Name is required" |
| Name | Min 3 chars | "Name must be at least 3 characters long" |
| Price | Min 0 | "Price must be greater than or equal to 0" |

- Submit button is **disabled** while the form is invalid
- Clicking **Submit** while invalid marks all fields as touched and shows all errors

---

### 18. Login Form Validation

| Field | Rule | Error message |
|-------|------|---------------|
| Email | Required | "Email is required." |
| Email | Valid format | "Enter a valid email address." |
| Password | Required | "Password is required." |
| Password | Min 6 chars | "Password must be at least 6 characters." |

---

### 19. Register Form Validation

All login rules apply, plus:

| Condition | Error message |
|-----------|---------------|
| Passwords don't match | "Passwords do not match." |

---

## Error Handling Tests

### 20. Reserved Object IDs (1–13)

**Steps:** Try to edit or delete object ID 1–13

**Expected:** A user-friendly error message:
- *"This is a demo object (ID 1–13) and cannot be edited."*
- *"This operation is not allowed. The object may be read-only or a demo object."*

---

### 21. 404 — Unknown Route

**Steps:** Navigate to `http://localhost:4200/does-not-exist`

**Expected:** Custom 404 page with links to Home and Inventory List.

---

### 22. API Rate Limit

**Steps:** Make many API requests in quick succession

**Expected:**
- Error message: *"Daily API request limit reached. Please try again tomorrow."*
- Home page API Status card shows **Limit Reached** in red

---

## Test Checklist

### Authentication
- [ ] Register creates a new account and logs in automatically
- [ ] Login with correct credentials stores the token
- [ ] Login with wrong credentials shows an error
- [ ] Unauthenticated users are redirected to `/login` from guarded routes
- [ ] After login, the `returnUrl` redirect works correctly
- [ ] Non-admin users cannot access `/admin`
- [ ] Admin users see the Admin link in the navbar
- [ ] Logout clears the token and redirects to `/login`
- [ ] Token persists across page refreshes

### API Endpoints
- [ ] GET /objects — list loads on the Inventory page
- [ ] GET /objects/{id} — detail page loads correctly
- [ ] GET /objects?id=x&id=y — filtered list works
- [ ] POST /objects — Create form submits and shows new item
- [ ] PUT /objects/{id} — Edit form saves full replacement
- [ ] PATCH /objects/{id} — Quick Rename updates name only
- [ ] DELETE /objects/{id} — item removed after confirm

### Forms & Validation
- [ ] Name field: required + min 3 chars enforced
- [ ] Price field: negative values rejected
- [ ] Submit button disabled while form is invalid
- [ ] Validation messages appear after field is touched
- [ ] Password confirmation mismatch shows error

### UI / Navigation
- [ ] All 10 routes load without errors
- [ ] Navbar links match login state
- [ ] Every page has an `<h1>` heading
- [ ] Loading spinner appears during API calls
- [ ] Error messages shown on API failures
- [ ] Activity log on Account page tracks creates, renames, and deletes
- [ ] Responsive layout works on mobile screen sizes
