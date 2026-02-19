export interface ApiObject {
  id?: string;
  name: string;
  data?: ObjectData | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ObjectData {
  color?: string;
  price?: number;
  [key: string]: any; // Allow flexible key/value pairs
}

export interface ApiResponse<T> {
  data: T;
}

export interface DeleteResponse {
  message: string;
}