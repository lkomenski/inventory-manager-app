/**
 * API Response Model
 * 
 * Represents the structure of objects returned from the RESTful API.
 * Example:
 * {
 *   "id": "7",
 *   "name": "Apple MacBook Pro 16",
 *   "data": {
 *     "year": 2019,
 *     "price": 1849.99,
 *     "CPU model": "Intel Core i9",
 *     "Hard disk size": "1 TB"
 *   },
 *   "createdAt": "2022-11-21T20:06:23.986Z",
 *   "updatedAt": "2022-12-25T21:08:41.986Z"
 * }
 */
export interface APIResponse {
  id: string;  // Unique identifier for the object
  name: string;  // Display name of the object
  data: {
    [key: string]: string | number;  // Flexible key-value pairs - different objects can have different fields
  };
  createdAt: string;  // ISO timestamp of creation
  updatedAt: string;  // ISO timestamp of last update
  message?: string;   // Optional - included in delete operation responses
}

/**
 * API Request Model
 * 
 * Represents the structure for creating or updating objects.
 * The 'id' field is not included as it's assigned by the API.
 * Example:
 * {
 *   "name": "Apple MacBook Pro 16",
 *   "data": {
 *     "year": 2019,
 *     "price": 2049.99,
 *     "CPU model": "Intel Core i9",
 *     "Hard disk size": "1 TB",
 *     "color": "silver"
 *   }
 * }
 */
export interface APIRequest {
  name: string;  // Required: name of the object
  data: {
    [key: string]: string | number;  // Custom fields - can vary per object
  };
}

/**
 * Legacy alias for backward compatibility
 * Use this type throughout the app for consistency
 */
export type ApiObject = APIResponse;

/**
 * Generic wrapper for API responses
 * Can be used for typed API responses in future enhancements
 */
export interface ApiResponse<T> {
  data: T;
}

/**
 * Delete Operation Response
 * Returned by the API when an object is successfully deleted
 */
export interface DeleteResponse {
  message: string;  // Confirmation message from API
}