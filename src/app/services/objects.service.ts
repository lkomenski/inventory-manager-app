import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, finalize } from 'rxjs/operators';
import { ApiObject, DeleteResponse, APIRequest } from '../models/object.model';
import { environment } from '../../environments/environment.local';

@Injectable({
  providedIn: 'root'
})
export class ObjectsService {
  // Using the proxy to avoid CORS issues during development
  private readonly apiUrl = environment.apiUrl;
  private readonly apiKey = environment.apiKey;
  
  // Loading state signal
  public loading = signal(false);
  
  // Error state signal
  public error = signal<string | null>(null);

  constructor(private readonly http: HttpClient) {
    // console.log('ObjectsService initialized');
    // console.log('API URL:', this.apiUrl);
    // console.log('API Key configured:', this.apiKey ? 'Yes' : 'No');
  }

  /**
   * Get HTTP headers with API key
   */
  private getHeaders(): HttpHeaders {
    // console.log('Setting up request headers with API key');
    return new HttpHeaders({
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json'
    });
  }

  /**
   * GET /objects - Load all objects
   */
  getObjects(): Observable<ApiObject[]> {
    // console.log('GET /objects - Fetching all objects');
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.get<ApiObject[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      tap((objects) => {
        // console.log('GET /objects - Success! Retrieved', objects.length, 'objects');
        // console.table(objects);
        this.loading.set(false);
      }),
      catchError(this.handleError.bind(this)),
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * GET /objects?id=x&id=y&id=z - Load objects by multiple IDs
   */
  getObjectsByIds(ids: string[]): Observable<ApiObject[]> {
    // console.log('GET /objects (by IDs) - Fetching objects:', ids);
    this.loading.set(true);
    this.error.set(null);
    
    const queryParams = ids.map(id => `id=${id}`).join('&');
    const url = `${this.apiUrl}?${queryParams}`;
    // console.log('Request URL:', url);
    
    return this.http.get<ApiObject[]>(url, { headers: this.getHeaders() }).pipe(
      tap((objects) => {
        // console.log('GET /objects (by IDs) - Success! Retrieved', objects.length, 'objects');
        // console.log('Objects:', objects);
        this.loading.set(false);
      }),
      catchError(this.handleError.bind(this)),
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * GET /objects/{id} - Load single object by id
   */
  getObject(id: string): Observable<ApiObject> {
    // console.log('GET /objects/' + id + ' - Fetching single object');
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.get<ApiObject>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      tap((object) => {
        // console.log('GET /objects/' + id + ' - Success!');
        // console.log('Object:', object);
        this.loading.set(false);
      }),
      catchError(this.handleError.bind(this)),
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * POST /objects - Create a new object
   */
  createObject(object: APIRequest): Observable<ApiObject> {
    // console.log('POST /objects - Creating new object');
    // console.log('Request payload:', object);
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.post<ApiObject>(this.apiUrl, object, { headers: this.getHeaders() }).pipe(
      tap((createdObject) => {
        // console.log('POST /objects - Success! Object created');
        // console.log('Created object:', createdObject);
        // console.log('New object ID:', createdObject.id);
        this.loading.set(false);
      }),
      catchError(this.handleError.bind(this)),
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * PUT /objects/{id} - Update object (full replacement)
   */
  updateObject(id: string, object: APIRequest): Observable<ApiObject> {
    // console.log('PUT /objects/' + id + ' - Updating object (full replacement)');
    // console.log('Request payload:', object);
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.put<ApiObject>(`${this.apiUrl}/${id}`, object, { headers: this.getHeaders() }).pipe(
      tap((updatedObject) => {
        // console.log('PUT /objects/' + id + ' - Success! Object updated');
        // console.log('Updated object:', updatedObject);
        this.loading.set(false);
      }),
      catchError(this.handleError.bind(this)),
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * PATCH /objects/{id} - Update object (partial update)
   */
  patchObject(id: string, partial: Partial<ApiObject>): Observable<ApiObject> {
    // console.log('PATCH /objects/' + id + ' - Updating object (partial)');
    // console.log('Request payload (partial):', partial);
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.patch<ApiObject>(`${this.apiUrl}/${id}`, partial, { headers: this.getHeaders() }).pipe(
      tap((updatedObject) => {
        // console.log('PATCH /objects/' + id + ' - Success! Object updated');
        // console.log('Updated object:', updatedObject);
        this.loading.set(false);
      }),
      catchError(this.handleError.bind(this)),
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * DELETE /objects/{id} - Delete an object
   */
  deleteObject(id: string): Observable<DeleteResponse> {
    // console.log('DELETE /objects/' + id + ' - Deleting object');
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.delete<DeleteResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      tap((response) => {
        // console.log('DELETE /objects/' + id + ' - Success! Object deleted');
        // console.log('Delete response:', response);
        this.loading.set(false);
      }),
      catchError(this.handleError.bind(this)),
      finalize(() => this.loading.set(false))
    );
  }

  /**
   * Handle HTTP errors and provide user-friendly messages
   */
  private handleError(error: HttpErrorResponse) {
    // console.group('HTTP Error occurred');
    // console.error('Error details:', {
    //   status: error.status,
    //   statusText: error.statusText,
    //   url: error.url,
    //   message: error.message
    // });
    
    // DEBUGGING BREAKPOINT: Set a breakpoint on the next line to inspect error details
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      // Backend error - check for specific error messages first
      if (error.error?.error && typeof error.error.error === 'string') {
        // API returned a specific error message
        if (error.error.error.includes('reserved id')) {
          errorMessage = 'This is a demo object (ID 1-13) and cannot be edited. Please create a new object to test editing.';
        } else {
          errorMessage = error.error.error;
        }
      } else {
        errorMessage = `Server error (${error.status}): ${error.message}`;
        
        // Provide more specific messages based on status codes
        switch (error.status) {
          case 404:
            errorMessage = 'Object not found';
            break;
          case 400:
            errorMessage = 'Invalid request. Please check your data';
            break;
          case 405:
            errorMessage = 'This operation is not allowed. The object may be read-only or a demo object (ID 1-13).';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later';
            break;
          case 0:
            errorMessage = 'Unable to connect to the server. Please check your internet connection';
            break;
        }
      }
    }
    
    this.error.set(errorMessage);
    this.loading.set(false);
    
    // console.error('Final error message:', errorMessage);
    // console.groupEnd();
    
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Clear error state
   */
  clearError(): void {
    // console.log('Clearing error state');
    this.error.set(null);
  }
}