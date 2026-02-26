# Testing Guide

This document provides test cases for the Inventory Manager Application to verify all features work correctly against the API requirements.

## Quick Start
1. Start the development server: `npm start`
2. Open http://localhost:4200 in your browser
3. Open Browser DevTools (F12) to view console logs for debugging
4. Commented console.log statements are available throughout the code - uncomment them if needed for debugging

---

## API Integration Tests

Test that all API endpoints work correctly and return expected outputs matching the [restful-api.dev](https://restful-api.dev/) documentation.

### 1. GET All Objects
**Endpoint**: `GET /objects`  
**Steps**: Navigate to http://localhost:4200/objects  
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
**Steps**: Navigate to http://localhost:4200/objects?id=3&id=5&id=10  
**Expected Output**: Array containing only objects with IDs 3, 5, and 10  
**Verification**: 
- Blue "Filtered View" banner appears
- Only requested objects display
- "View All" link clears filter

### 4. POST Create Object
**Endpoint**: `POST /objects`  
**Steps**: 
1. Navigate to http://localhost:4200/objects/create
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

### Home Page
**Test**: Navigate to http://localhost:4200  
**Expected**:
- Overview section shows: Total Items, Last Updated timestamp, API Status, API connection status
- API Status shows "Connected" (green) or "Disconnected" (red) based on connection
- API Limit shows "Active" or rate limit info if available
- Quick action cards for: View All Items, Add New Item, My Account, API Information

### List View Features
**Test**: Navigate to http://localhost:4200/objects  
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
**Test**: Navigate to http://localhost:4200/objects/create  
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
- Navbar links work: Home, Objects List, Create, Account
- Breadcrumb navigation works on all pages
- Back buttons return to previous page
- Logo/title links return to home

### Error Handling
**Test**: Trigger various errors  
**Expected Behaviors**:
- Invalid object ID: Shows "Object not found" error
- Network offline: Shows connection error
- Rate limit exceeded: Shows "Daily API request limit reached" message
- Read-only object edit: Shows clear error message about demo objects
- Form validation: Highlights required fields

---

## Debugging Notes

**Breakpoint Locations**: Search for `DEBUGGING BREAKPOINT` comments in:
- `src/app/services/objects.service.ts` (error handling)
- `src/app/pages/objects-list/objects-list.component.ts` (API calls)
- `src/app/pages/object-detail/object-detail.component.ts` (loading, delete)
- `src/app/pages/object-create/object-create.component.ts` (form submission)
- `src/app/pages/object-edit/object-edit.component.ts` (loading, update)

**Console Logs**: All console.log statements are commented out. To enable debugging:
1. Search for `// console.log` in any file
2. Uncomment the lines you need
3. Restart the dev server if needed

---

## Test Checklist

### Core Requirements
- [ ] All 6 API endpoints work correctly (GET all, GET by ID, GET by IDs, POST, PUT, DELETE)
- [ ] API outputs match expected JSON structure from restful-api.dev
- [ ] CRUD operations function properly
- [ ] Navigation between pages works
- [ ] Error handling displays appropriate messages

### Additional Features
- [ ] Search/filter functionality
- [ ] Sorting (A-Z, Z-A)
- [ ] Pagination
- [ ] Query parameter filtering
- [ ] Form validation
- [ ] Dynamic API status display
- [ ] Rate limit handling
- [ ] Responsive design (test on mobile/tablet)
