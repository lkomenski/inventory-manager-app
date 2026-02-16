import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ObjectsService } from '../../services/objects.service';
import { ApiObject } from '../../models/object.model';

@Component({
  selector: 'app-objects-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen py-12 bg-gray-50">
      <div class="container mx-auto px-4">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 class="text-4xl font-semibold text-gray-900">Inventory List</h1>
          <a routerLink="/objects/create" 
             class="bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Add New Item
          </a>
        </div>

        <!-- Loading State -->
        @if (loading()) {
          <div class="text-center py-20">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            <p class="text-gray-600 mt-4 font-medium">Loading items...</p>
          </div>
        }

        <!-- Error State -->
        @if (error()) {
          <div class="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div class="flex items-start">
              <svg class="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-grow">
                <h3 class="font-semibold text-red-900 mb-1">Error Loading Items</h3>
                <p class="text-red-700 text-sm">{{ error() }}</p>
              </div>
            </div>
            <button (click)="loadObjects()" 
                    class="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium text-sm">
              Try Again
            </button>
          </div>
        }

        <!-- Empty State -->
        @if (!loading() && !error() && objects().length === 0) {
          <div class="text-center py-20 bg-white border border-gray-200 rounded-lg shadow-sm">
            <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
            </svg>
            <h2 class="text-2xl font-semibold text-gray-900 mb-2">No Items Yet</h2>
            <p class="text-gray-600 mb-6">Get started by adding your first item</p>
            <a routerLink="/objects/create" 
               class="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium">
              Add Your First Item
            </a>
          </div>
        }

        <!-- Objects Table -->
        @if (!loading() && !error() && objects().length > 0) {
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="text-left py-3 px-4 font-semibold text-sm text-gray-700">ID</th>
                    <th class="text-left py-3 px-4 font-semibold text-sm text-gray-700">Name</th>
                    <th class="text-left py-3 px-4 font-semibold text-sm text-gray-700">Color</th>
                    <th class="text-left py-3 px-4 font-semibold text-sm text-gray-700">Price</th>
                    <th class="text-right py-3 px-4 font-semibold text-sm text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  @for (object of objects(); track object.id) {
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="py-3 px-4 text-sm text-gray-600">{{ object.id }}</td>
                      <td class="py-3 px-4 text-sm font-medium text-gray-900">{{ object.name }}</td>
                      <td class="py-3 px-4 text-sm text-gray-700">
                        @if (object.data?.color) {
                          <span class="inline-flex items-center">
                            <span class="w-5 h-5 rounded-full mr-2 border border-gray-300" 
                                  [style.background-color]="object.data!.color"></span>
                            <span>{{ object.data!.color }}</span>
                          </span>
                        } @else {
                          <span class="text-gray-400">N/A</span>
                        }
                      </td>
                      <td class="py-3 px-4 text-sm font-medium text-gray-900">
                        @if (object.data?.price) {
                          <span class="text-green-700">\${{ object.data!.price }}</span>
                        } @else {
                          <span class="text-gray-400">N/A</span>
                        }
                      </td>
                      <td class="py-3 px-4">
                        <div class="flex justify-end gap-2">
                          <a [routerLink]="['/objects', object.id]" 
                             class="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                            View
                          </a>
                          <a [routerLink]="['/objects', object.id, 'edit']" 
                             class="bg-gray-600 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors text-sm font-medium">
                            Edit
                          </a>
                          <button (click)="confirmDelete(object)" 
                                  class="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                                  [disabled]="deleting()">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Item Count -->
          <div class="mt-6 text-center">
            <span class="inline-block bg-white border border-gray-200 px-4 py-2 rounded-md font-medium text-sm text-gray-700 shadow-sm">
              Showing {{ objects().length }} item(s)
            </span>
          </div>
        }

        <!-- Delete Confirmation Modal -->
        @if (showDeleteModal()) {
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
              <h3 class="text-xl font-semibold text-gray-900 mb-3">Confirm Delete</h3>
              <p class="text-gray-600 mb-6">
                Are you sure you want to delete <strong class="text-gray-900">"{{ objectToDelete()?.name }}"</strong>? This action cannot be undone.
              </p>
              <div class="flex justify-end gap-3">
                <button (click)="cancelDelete()" 
                        class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
                        [disabled]="deleting()">
                  Cancel
                </button>
                <button (click)="deleteObject()" 
                        class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                        [disabled]="deleting()">
                  {{ deleting() ? 'Deleting...' : 'Delete' }}
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ObjectsListComponent implements OnInit {
  objects = signal<ApiObject[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  showDeleteModal = signal(false);
  objectToDelete = signal<ApiObject | null>(null);
  deleting = signal(false);

  constructor(private objectsService: ObjectsService) {}

  ngOnInit(): void {
    this.loadObjects();
  }

  loadObjects(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.objectsService.getObjects().subscribe({
      next: (data) => {
        this.objects.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  confirmDelete(object: ApiObject): void {
    this.objectToDelete.set(object);
    this.showDeleteModal.set(true);
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.objectToDelete.set(null);
  }

  deleteObject(): void {
    const object = this.objectToDelete();
    if (!object?.id) return;

    this.deleting.set(true);
    
    this.objectsService.deleteObject(object.id).subscribe({
      next: () => {
        // Remove from local list
        this.objects.update(list => list.filter(o => o.id !== object.id));
        this.showDeleteModal.set(false);
        this.objectToDelete.set(null);
        this.deleting.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.deleting.set(false);
        this.showDeleteModal.set(false);
      }
    });
  }
}
