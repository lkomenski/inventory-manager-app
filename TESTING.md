# Testing Guide

This document outlines comprehensive test cases for the Inventory Manager Application. Use these test scenarios to verify all functionality works correctly.

## Table of Contents
- [Debugging Setup](#debugging-setup)
- [Console Logging](#console-logging)
- [Test Cases by Feature](#test-cases-by-feature)
  - [1. List View](#1-list-view)
  - [2. Detail View](#2-detail-view)
  - [3. Create Object](#3-create-object)
  - [4. Edit Object](#4-edit-object)
  - [5. Delete Object](#5-delete-object)
  - [6. Navigation](#6-navigation)
  - [7. Error Handling](#7-error-handling)
  - [8. Form Validation](#8-form-validation)
  - [9. Server-Side Rendering](#9-server-side-rendering)
- [API Integration Tests](#api-integration-tests)
- [Browser DevTools Guide](#browser-devtools-guide)

---

## Debugging Setup

### Setting Breakpoints in VS Code

The codebase includes strategic comments marked with `DEBUGGING BREAKPOINT` where you can set breakpoints:

1. **Objects Service** (`src/app/services/objects.service.ts`):
   - Line with "Set a breakpoint on the next line to inspect error details"
   
2. **Objects List Component** (`src/app/pages/objects-list/objects-list.component.ts`):
   - Line with "Set a breakpoint here to debug API calls"
   
3. **Object Detail Component** (`src/app/pages/object-detail/object-detail.component.ts`):
   - Line with "Set a breakpoint here to debug object loading"
   - Line with "Set a breakpoint here to debug delete operation"
   
4. **Object Create Component** (`src/app/pages/object-create/object-create.component.ts`):
   - Line with "Set a breakpoint here to inspect form data"
   
5. **Object Edit Component** (`src/app/pages/object-edit/object-edit.component.ts`):
   - Line with "Set a breakpoint here to debug object loading"
   - Line with "Set a breakpoint here to inspect form data"

### How to Set Breakpoints

1. Open the file in VS Code
2. Click in the gutter (left of line numbers) where you want to pause execution
3. A red dot will appear indicating a breakpoint
4. Run the app in debug mode (F5) or with Chrome DevTools open
5. When code hits the breakpoint, execution will pause for inspection

---

## Console Logging

The application includes extensive console logging with emoji indicators for easy identification:

### Service Logs (objects.service.ts)
- 🔧 `ObjectsService initialized` - Service startup
- 📡 `API URL` - Configured endpoint
- 🔑 `API Key configured` - Key status
- 🔐 `Setting up request headers` - Request preparation

### API Operation Logs
- 📋 `GET /objects` - Fetching all objects
- 🔍 `GET /objects (by IDs)` - Fetching specific objects
- 🎯 `GET /objects/{id}` - Fetching single object
- ➕ `POST /objects` - Creating new object
- ✏️ `PUT /objects/{id}` - Updating object (full)
- 🔧 `PATCH /objects/{id}` - Updating object (partial)
- 🗑️ `DELETE /objects/{id}` - Deleting object
- ✅ Success messages with data
- ❌ Error messages with details

### Component Logs
- 📝 Component initialization messages
- 🚀 Lifecycle method calls (ngOnInit)
- 🔍 Search and filter operations
- 📊 Pagination information
- ⬆️⬇️ Sort operations
- 🧭 Navigation actions
- 🛡️ Delete confirmations
- 📤 Form submissions

### How to View Console Logs

1. Open browser DevTools (F12)
2. Go to Console tab
3. Perform actions in the app
4. Watch the detailed logs appear with emoji indicators
5. Use the filter box to search for specific operations

---

## Test Cases by Feature

### 1. List View

#### Test Case 1.1: Load All Objects
**Objective**: Verify all objects load correctly from the API

**Steps**:
1. Navigate to http://localhost:4200/objects
2. Open browser console (F12)
3. Observe the loading indicator appears
4. Check console for "📋 GET /objects" log
5. Wait for objects to load

**Expected Results**:
- ✅ Loading spinner displays while fetching
- ✅ Console shows "✅ GET /objects - Success!"
- ✅ Objects display in a table format
- ✅ Each object shows ID and name
- ✅ Action buttons (View, Edit, Delete) appear for each row

**Console Logs to Check**:
```
📋 GET /objects - Fetching all objects
✅ GET /objects - Success! Retrieved X objects
```

---

#### Test Case 1.2: Search Functionality
**Objective**: Verify search filters objects correctly

**Steps**:
1. Navigate to objects list
2. Wait for objects to load
3. Type "iphone" into the search box
4. Check console for filter logs

**Expected Results**:
- ✅ Table filters to show only matching objects
- ✅ Case-insensitive search works
- ✅ Pagination resets to page 1
- ✅ Console shows "🔎 Search changed to: iphone"

**Test Variations**:
- Partial matches (e.g., "app" matches "Apple")
- Empty search (shows all objects)
- No matches (shows empty state)

---

#### Test Case 1.3: Sorting A-Z
**Objective**: Verify alphabetical sorting works

**Steps**:
1. Navigate to objects list
2. Click "Sort A-Z" button
3. Observe the list order
4. Check console logs

**Expected Results**:
- ✅ Objects sort alphabetically by name
- ✅ Pagination resets to page 1
- ✅ Console shows "⬆️ Sorting A-Z"

---

#### Test Case 1.4: Sorting Z-A
**Objective**: Verify reverse alphabetical sorting

**Steps**:
1. Navigate to objects list
2. Click "Sort Z-A" button
3. Observe the list order

**Expected Results**:
- ✅ Objects sort reverse alphabetically by name
- ✅ Pagination resets to page 1
- ✅ Console shows "⬇️ Sorting Z-A"

---

#### Test Case 1.5: Clear Sort
**Objective**: Verify sort can be cleared

**Steps**:
1. Apply any sort (A-Z or Z-A)
2. Click "Clear Sort" button
3. Observe the list returns to original order

**Expected Results**:
- ✅ Objects return to API order
- ✅ Console shows "🔄 Clearing sort"

---

#### Test Case 1.6: Pagination
**Objective**: Verify pagination controls work correctly

**Steps**:
1. Navigate to objects list
2. Check current page display (e.g., "Page 1 of 3")
3. Click "Next" button
4. Observe page change
5. Click "Previous" button
6. Try "First" and "Last" buttons

**Expected Results**:
- ✅ Page number updates correctly
- ✅ Correct items display for each page
- ✅ Buttons disable appropriately (Previous on page 1, Next on last page)
- ✅ Console shows pagination info with each change

---

#### Test Case 1.7: Filter by Multiple IDs (Query Parameters)
**Objective**: Verify filtering by specific object IDs via URL query parameters

**Steps**:
1. Navigate to http://localhost:4200/objects
2. Note some object IDs from the list (e.g., "1", "2", "3")
3. Navigate to http://localhost:4200/objects?id=1&id=2&id=3
4. Check console logs
5. Observe the filtered results

**Expected Results**:
- ✅ Blue banner appears showing "Filtered View"
- ✅ Banner displays the IDs: "Showing objects with IDs: 1, 2, 3"
- ✅ Only the requested objects appear in the list
- ✅ Console shows "🔍 Query parameters detected - Loading specific IDs: [1, 2, 3]"
- ✅ Console shows "🔍 GET /objects (by IDs) - Fetching objects: [1, 2, 3]"
- ✅ Console shows "🌐 Request URL: /api/objects?id=1&id=2&id=3"
- ✅ "View All" link appears in banner to clear filter

**Test Variations**:
- Single ID: `?id=5` (shows only that object)
- Non-existent IDs: `?id=999999` (shows empty list or error)
- Mix of valid and invalid: `?id=1&id=999999` (shows only valid ones)

---

#### Test Case 1.8: Clear ID Filter
**Objective**: Verify returning to full list from filtered view

**Steps**:
1. Navigate to http://localhost:4200/objects?id=1&id=2
2. Wait for filtered results to load
3. Click "View All" link in the blue banner

**Expected Results**:
- ✅ Navigates to /objects (no query params)
- ✅ Blue filter banner disappears
- ✅ Full list of all objects loads
- ✅ Console shows "📋 No query parameters - Loading all objects"

---

### 2. Detail View

#### Test Case 2.1: View Object Details
**Objective**: Verify object details display correctly

**Steps**:
1. Navigate to objects list
2. Click "View" button on any object
3. Check browser console
4. Observe the detail page

**Expected Results**:
- ✅ URL changes to `/objects/{id}`
- ✅ Console shows "🎯 GET /objects/{id} - Fetching single object"
- ✅ Console shows "✅ GET /objects/{id} - Success!"
- ✅ Object name displays
- ✅ Object ID displays in "Basic Information" section
- ✅ Additional data fields display if present
- ✅ Color picker shows color value if present
- ✅ Price displays with $ symbol if present

---

#### Test Case 2.2: View Invalid Object ID
**Objective**: Verify error handling for non-existent objects

**Steps**:
1. Navigate to http://localhost:4200/objects/999999999
2. Check console for error logs
3. Observe the error message

**Expected Results**:
- ✅ Error message displays: "Object not found"
- ✅ Console shows error details
- ✅ "Try Again" button appears
- ✅ "Back to List" link works

---

#### Test Case 2.3: Navigate Back to List
**Objective**: Verify back navigation works

**Steps**:
1. View any object detail page
2. Click "← Back to List" link at top

**Expected Results**:
- ✅ Navigates to objects list
- ✅ List reloads with current data

---

### 3. Create Object

#### Test Case 3.1: Create Valid Object (Minimum Required Fields)
**Objective**: Create object with only required fields

**Steps**:
1. Navigate to http://localhost:4200/objects/create
2. Fill in name field: "Test Object"
3. Leave color and price empty
4. Don't add any custom fields
5. Click "Create Item"
6. Check console logs

**Expected Results**:
- ✅ Form submits successfully
- ✅ Console shows "📤 Form submitted with data:"
- ✅ Console shows "📦 Creating object:"
- ✅ Console shows "➕ POST /objects - Creating new object"
- ✅ Console shows "✅ POST /objects - Success! Object created"
- ✅ Console shows "🆔 New object ID: {id}"
- ✅ Success message displays
- ✅ After 1 second, navigates to detail page
- ✅ New object displays correctly

---

#### Test Case 3.2: Create Object with All Fields
**Objective**: Create object with all optional fields

**Steps**:
1. Navigate to create page
2. Fill in name: "Complete Test Object"
3. Select color using color picker: #FF5733
4. Enter price: 299.99
5. Click "Add Field"
6. Select "capacity" from dropdown (auto-populated from API)
7. Enter value: "256 GB"
8. Click "Add Field" again
9. Select "✏️ Custom field name..."
10. Enter custom field name: "warranty"
11. Enter value: "2 years"
12. Click "Create Item"

**Expected Results**:
- ✅ All fields submit correctly
- ✅ Created object includes all data
- ✅ Color displays correctly on detail page
- ✅ Price formats with $ symbol
- ✅ Capacity field shows in Additional Data
- ✅ Custom warranty field shows in Additional Data

---

#### Test Case 3.3: Form Validation - Empty Name
**Objective**: Verify name field validation

**Steps**:
1. Navigate to create page
2. Leave name field empty
3. Try to click "Create Item"

**Expected Results**:
- ✅ Submit button is disabled
- ✅ Error message shows: "Name is required"

---

#### Test Case 3.4: Form Validation - Short Name
**Objective**: Verify minimum name length validation

**Steps**:
1. Navigate to create page
2. Enter name: "ab" (2 characters)
3. Try to submit

**Expected Results**:
- ✅ Submit button is disabled
- ✅ Error message shows: "Name must be at least 3 characters"

---

#### Test Case 3.5: Form Validation - Negative Price
**Objective**: Verify price cannot be negative

**Steps**:
1. Navigate to create page
2. Enter valid name
3. Enter price: -50
4. Try to submit

**Expected Results**:
- ✅ Submit button is disabled
- ✅ Error message shows: "Price must be 0 or greater"

---

#### Test Case 3.6: Dynamic Field - Select from Dropdown
**Objective**: Verify dropdown shows field names from API with auto-detection

**Steps**:
1. Navigate to create page
2. Click "Add Field"
3. Click the field name dropdown
4. Observe the available options

**Expected Results**:
- ✅ Dropdown shows common field names (year, capacity, CPU model, etc.)
- ✅ Fields are populated from actual API objects
- ✅ "✏️ Custom field name..." option appears
- ✅ Selecting a field auto-detects type from API data

---

#### Test Case 3.7: Dynamic Field - Custom Field Name
**Objective**: Verify custom field entry works

**Steps**:
1. Navigate to create page
2. Click "Add Field"
3. Select "✏️ Custom field name..." from dropdown
4. Input field changes to text input
5. Enter custom field name: "bluetooth"
6. Enter value: "5.0"

**Expected Results**:
- ✅ Dropdown changes to text input
- ✅ Can enter any field name
- ✅ "📋 List" button appears to switch back to dropdown
- ✅ Field submits correctly with custom name

---

#### Test Case 3.8: Dynamic Field - Remove Field
**Objective**: Verify fields can be removed

**Steps**:
1. Navigate to create page
2. Add 2-3 custom fields
3. Click trash icon on middle field
4. Observe the change

**Expected Results**:
- ✅ Field is removed immediately
- ✅ Other fields remain intact
- ✅ Form remains valid if required fields still present

---

#### Test Case 3.9: Cancel Creation
**Objective**: Verify cancel navigation works

**Steps**:
1. Navigate to create page
2. Enter some data (don't submit)
3. Click "Back to List" button
4. Check console

**Expected Results**:
- ✅ Navigates to objects list
- ✅ No object is created
- ✅ Console shows "❌ Form cancelled"

---

### 4. Edit Object

#### Test Case 4.1: Edit Existing Object (User-Created)
**Objective**: Successfully edit a user-created object

**Prerequisites**: Create a test object first

**Steps**:
1. Create a new object (see Test 3.1)
2. Navigate to its detail page
3. Click "Edit Object" button
4. Observe form pre-population
5. Change name to "Updated Test Object"
6. Change price to 399.99
7. Click "Update Item"
8. Check console logs

**Expected Results**:
- ✅ Form loads with current object data
- ✅ Console shows "📥 Loading object for editing"
- ✅ Console shows "✅ Object loaded for editing"
- ✅ Console shows "📝 Form initialized with data"
- ✅ All fields pre-filled correctly
- ✅ Console shows "📤 Edit form submitted with data"
- ✅ Console shows "✏️ PUT /objects/{id} - Updating object"
- ✅ Console shows "✅ Object updated successfully"
- ✅ Success message displays
- ✅ Navigates to detail page with updated data

---

#### Test Case 4.2: Edit Reserved Object (ID 1-13)
**Objective**: Verify reserved objects cannot be edited

**Steps**:
1. Navigate to http://localhost:4200/objects/1/edit
2. Try to submit changes
3. Check error message
4. Check console logs

**Expected Results**:
- ✅ Can load the edit form
- ✅ On submit, error message displays
- ✅ Error says: "This is a demo object (ID 1-13) and cannot be edited. Please create a new object to test editing."
- ✅ Console shows detailed error group with ❌
- ✅ Stay on edit page (don't navigate away)

---

#### Test Case 4.3: Edit Form Validation
**Objective**: Verify validation works on edit form

**Steps**:
1. Edit any user-created object
2. Clear the name field
3. Try to submit

**Expected Results**:
- ✅ Submit button is disabled
- ✅ Validation errors display
- ✅ Same validation as create form

---

#### Test Case 4.4: Cancel Edit
**Objective**: Verify cancel returns to detail page

**Steps**:
1. Navigate to edit page for any object
2. Make some changes (don't submit)
3. Click "Back to Details"
4. Check console

**Expected Results**:
- ✅ Navigates back to detail page
- ✅ Changes are not saved
- ✅ Console shows "❌ Form cancelled"

---

### 5. Delete Object

#### Test Case 5.1: Delete User-Created Object
**Objective**: Successfully delete a user-created object

**Prerequisites**: Create a test object first

**Steps**:
1. Create a new test object
2. Navigate to its detail page
3. Click "Delete" button
4. Check that modal appears
5. Check console for "🛡️ Delete confirmation requested"
6. Click "Yes, Delete" in modal
7. Check console logs

**Expected Results**:
- ✅ Delete confirmation modal displays
- ✅ Modal shows object name
- ✅ Console shows "🗑️ Deleting object: {id}"
- ✅ Console shows "🗑️ DELETE /objects/{id} - Deleting object"
- ✅ Console shows "✅ DELETE /objects/{id} - Success!"
- ✅ Navigates to objects list
- ✅ Deleted object no longer appears in list

---

#### Test Case 5.2: Cancel Delete
**Objective**: Verify delete can be cancelled

**Steps**:
1. Navigate to any object detail page
2. Click "Delete" button
3. Modal appears
4. Click "Cancel"

**Expected Results**:
- ✅ Modal closes
- ✅ Object is not deleted
- ✅ Stay on detail page
- ✅ Console shows "❌ Delete cancelled"

---

#### Test Case 5.3: Delete from List View
**Objective**: Verify delete works from list view

**Steps**:
1. Navigate to objects list
2. Click "Delete" button on a user-created object
3. Confirm deletion in modal
4. Check that list refreshes

**Expected Results**:
- ✅ Confirmation modal appears
- ✅ After confirmation, object removed from list
- ✅ Console logs show delete operation

---

#### Test Case 5.4: Delete Reserved Object (ID 1-13)
**Objective**: Verify reserved objects cannot be deleted

**Steps**:
1. Navigate to detail page for object ID 1-13
2. Click "Delete" button
3. Confirm in modal
4. Check error message

**Expected Results**:
- ✅ Error message displays
- ✅ Error mentions demo/reserved object
- ✅ Object is not deleted
- ✅ Console shows error details

---

### 6. Navigation

#### Test Case 6.1: Home Page Navigation
**Objective**: Verify home page loads and links work

**Steps**:
1. Navigate to http://localhost:4200/
2. Observe the page content
3. Check navbar links
4. Click "Add New Item" button

**Expected Results**:
- ✅ Home page displays properly
- ✅ Quick stats show (if implemented)
- ✅ "Add New Item" navigates to create page
- ✅ Navbar shows "Inventory Manager", "Inventory", "Add New Item"

---

#### Test Case 6.2: Navbar Links
**Objective**: Verify all navbar links work

**Steps**:
1. From any page, test each navbar link:
   - Click "Inventory Manager" logo/text
   - Click "Inventory"
   - Click "Add New Item"
   - Click "Account"

**Expected Results**:
- ✅ "Inventory Manager" → Home page (/)
- ✅ "Inventory" → Objects list (/objects)
- ✅ "Add New Item" → Create page (/objects/create)
- ✅ "Account" → Account page (/account)

---

#### Test Case 6.3: Breadcrumb Navigation
**Objective**: Verify breadcrumb/back links work

**Steps**:
1. Navigate through: Home → List → Detail → Edit
2. At each page, check for back/breadcrumb links
3. Test that they navigate correctly

**Expected Results**:
- ✅ Detail page has "← Back to List"
- ✅ Edit page has "Back to Details" in cancel button
- ✅ Create page has "Back to List" in cancel button

---

#### Test Case 6.4: 404 Not Found Page
**Objective**: Verify 404 page displays for invalid routes

**Steps**:
1. Navigate to http://localhost:4200/invalid-page-xyz
2. Check the page content
3. Check console for any errors

**Expected Results**:
- ✅ Custom 404 page displays
- ✅ Shows "404 - Page Not Found" message
- ✅ Provides link back to home
- ✅ Proper HTTP 404 status code (check Network tab)

---

### 7. Error Handling

#### Test Case 7.1: API Server Down
**Objective**: Verify graceful error handling when API is unreachable

**Steps**:
1. Stop the development server (Ctrl+C)
2. Try to load objects list
3. Observe error message

**Expected Results**:
- ✅ User-friendly error message displays
- ✅ Error mentions connection issue
- ✅ Console shows detailed error with status 0
- ✅ Option to retry available

---

#### Test Case 7.2: Invalid API Key
**Objective**: Verify API authentication error handling

**Steps**:
1. Edit `environment.local.ts`
2. Change `apiKey` to invalid value: "INVALID_KEY"
3. Restart the server
4. Try to load objects

**Expected Results**:
- ✅ Error message displays
- ✅ Console shows 401 or 403 error
- ✅ Helpful error message to user

---

#### Test Case 7.3: Network Timeout
**Objective**: Verify timeout handling

**Steps**:
1. Use browser DevTools to throttle network (slow 3G)
2. Try to perform operations
3. Observe loading states and timeout behavior

**Expected Results**:
- ✅ Loading indicators show during operations
- ✅ Operations complete or fail gracefully
- ✅ User receives feedback

---

### 8. Form Validation

#### Test Case 8.1: Real-time Validation
**Objective**: Verify validation updates as user types

**Steps**:
1. Navigate to create page
2. Focus name field
3. Type: "a" (1 char)
4. Type: "ab" (2 chars)
5. Type: "abc" (3 chars)
6. Observe validation messages

**Expected Results**:
- ✅ Error appears with < 3 characters
- ✅ Error clears at 3+ characters
- ✅ Submit button enables/disables accordingly

---

#### Test Case 8.2: Validation on Focus Lost
**Objective**: Verify validation triggers on blur

**Steps**:
1. Navigate to create page
2. Focus name field
3. Don't type anything
4. Click outside the field (blur)

**Expected Results**:
- ✅ Required field error displays after blur
- ✅ Error styling applies to field

---

#### Test Case 8.3: Multiple Validation Errors
**Objective**: Verify multiple errors display correctly

**Steps**:
1. Navigate to create page
2. Leave name empty
3. Enter price: -50
4. Try to submit

**Expected Results**:
- ✅ Both errors display simultaneously
- ✅ Submit button is disabled
- ✅ All errors must be fixed to enable submit

---

### 9. Server-Side Rendering

#### Test Case 9.1: SSR Initial Load
**Objective**: Verify server-side rendering works

**Steps**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Close DevTools
3. Navigate to http://localhost:4200/
4. Open DevTools → Network tab
5. Hard reload (Ctrl+Shift+R)
6. Inspect the HTML document response

**Expected Results**:
- ✅ Initial HTML contains rendered content
- ✅ Page is visible before JavaScript loads
- ✅ SSR reduces time to first meaningful paint

---

#### Test Case 9.2: CSP Headers
**Objective**: Verify Content Security Policy is configured

**Steps**:
1. Open DevTools → Network tab
2. Reload the page
3. Click on the document request
4. Check Response Headers

**Expected Results**:
- ✅ `Content-Security-Policy` header is present
- ✅ In development: allows `unsafe-eval` and `unsafe-inline`
- ✅ In production: stricter CSP settings

---

## API Integration Tests

### Test the Proxy Configuration

#### Test Case: API Proxy Works
**Objective**: Verify proxy forwards requests correctly

**Steps**:
1. Open DevTools → Network tab
2. Load objects list
3. Check the request URL

**Expected Results**:
- ✅ Requests go to `/api/objects` (relative URL)
- ✅ Proxy forwards to `https://api.restful-api.dev/objects`
- ✅ No CORS errors in console

---

### Test API Response Formats

#### Test Case: API Response Structure
**Objective**: Verify API responses match expected format

**Steps**:
1. Open DevTools → Network tab
2. Load objects list
3. Click on the `/api/objects` request
4. Check the Response tab

**Expected Results**:
- ✅ Response is JSON array
- ✅ Each object has `id`, `name`, `data` properties
- ✅ Data property is object or null

---

## Browser DevTools Guide

### How to Use Console for Debugging

1. **Open DevTools**: Press F12 or Ctrl+Shift+I (Windows) / Cmd+Option+I (Mac)

2. **Select Console Tab**: Click on "Console" at the top

3. **Filter Logs**: Use the filter box to search:
   - Type "GET" to see all GET requests
   - Type "❌" to see only errors
   - Type "✅" to see only successes
   - Type specific object ID to track operations

4. **Expand Objects**: Click the ▶ triangles to expand logged objects and inspect their properties

5. **Clear Console**: Click the 🚫 icon to clear old logs

6. **Preserve Log**: Check "Preserve log" to keep logs across page navigations

### How to Use Network Tab

1. **Open Network Tab**: DevTools → Network

2. **Filter by Type**: Click "XHR" to see only API requests

3. **Inspect Request**:
   - Click on any request
   - View Headers, Payload, Response, Timing

4. **Check Status Codes**:
   - 200 = Success
   - 201 = Created
   - 404 = Not Found
   - 405 = Method Not Allowed (reserved objects)
   - 500 = Server Error

### How to Set Breakpoints in DevTools

1. **Open Sources Tab**: DevTools → Sources

2. **Find TypeScript File**: 
   - Navigate to webpack:// → src → app
   - Open the file you want to debug

3. **Set Breakpoint**:
   - Click on line number where you want to pause
   - Blue marker appears

4. **Trigger the Code**:
   - Perform the action in the app
   - Execution will pause at breakpoint

5. **Inspect Variables**:
   - Hover over variables to see values
   - Use the Scope panel to see all variables
   - Use the Call Stack to see execution path

6. **Step Through Code**:
   - Step Over (F10): Execute current line
   - Step Into (F11): Enter function call
   - Step Out (Shift+F11): Exit current function
   - Continue (F8): Resume execution

---

## Summary Checklist

Before marking testing complete, verify:

- [ ] All list view features work (search, sort, pagination)
- [ ] Filter by multiple IDs via query parameters works
- [ ] Object details display correctly
- [ ] Can create objects with all field types
- [ ] Can edit user-created objects
- [ ] Cannot edit reserved objects (proper error)
- [ ] Can delete user-created objects
- [ ] Cannot delete reserved objects (proper error)
- [ ] All navigation links work
- [ ] Form validation prevents invalid submissions
- [ ] Error messages are user-friendly
- [ ] Console logs provide detailed debugging info
- [ ] API proxy works without CORS errors
- [ ] SSR loads pages correctly
- [ ] No console errors during normal operation

---

## Report Issues

When reporting issues, include:

1. **Test Case Number** (e.g., "Test Case 3.2")
2. **Expected Behavior** vs **Actual Behavior**
3. **Console Logs** (copy relevant logs)
4. **Network Tab** (screenshot of failed request)
5. **Steps to Reproduce**
6. **Browser Version** (e.g., Chrome 132, Firefox 115)

---

**Last Updated**: February 19, 2026
