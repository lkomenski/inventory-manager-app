/* Api response model
{
   "id": "7",
   "name": "Apple MacBook Pro 16",
   "data": {
      "year": 2019,
      "price": 1849.99,
      "CPU model": "Intel Core i9",
      "Hard disk size": "1 TB"
   },
   "createdAt": "2022-11-21T20:06:23.986Z",
   "updatedAt": "2022-12-25T21:08:41.986Z"
}
*/
export interface APIResponse {
  id: string;
  name: string;
  data: {
    [key: string]: string | number;
  };
  createdAt: string;
  updatedAt: string;
  message?: string; // Optional - included when object is deleted
}

/* API request model
{
   "name": "Apple MacBook Pro 16",
   "data": {
      "year": 2019,
      "price": 2049.99,
      "CPU model": "Intel Core i9",
      "Hard disk size": "1 TB",
      "color": "silver"
   }
}
*/
export interface APIRequest {
  name: string;
  data: {
    [key: string]: string | number;
  };
}

// Legacy alias for backward compatibility
export type ApiObject = APIResponse;

// Generic wrapper for API responses
export interface ApiResponse<T> {
  data: T;
}

// Delete operation response
export interface DeleteResponse {
  message: string;
}