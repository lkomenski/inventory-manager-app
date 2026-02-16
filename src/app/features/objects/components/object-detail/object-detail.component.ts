import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ObjectsService } from '../../services/objects.service';
import { ApiObject } from '../../models/object.model';

@Component({
  selector: 'app-object-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen py-12 bg-gray-50">
      <div class="container mx-auto px-4">
        <!-- Back Button -->
        <div class="mb-6">
          <a routerLink="/objects" 
             class="text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium transition-colors">
            ← Back to List
          </a>
        </div>

        <!-- Loading State -->
        @if (loading()) {
          <div class="text-center py-20">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            <p class="text-gray-600 mt-4 font-medium">Loading details...</p>
          </div>
        }

        <!-- Error State -->
        @if (error()) {
          <div class="bg-red-50 border border-red-200 rounded-lg p-6">
            <div class="flex items-start mb-4">
              <svg class="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-grow">
                <h3 class="font-semibold text-red-900 mb-1">Error Loading Object</h3>
                <p class="text-red-700 text-sm">{{ error() }}</p>
              </div>
            </div>
            <div class="flex gap-3">
              <button (click)="loadObject()" 
                      class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium text-sm">
                Try Again
              </button>
              <a routerLink="/objects" 
                 class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors font-medium text-sm inline-block">
                Back to List
              </a>
            </div>
          </div>
        }

        <!-- Object Details -->
        @if (object() && !loading()) {
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <!-- Header -->
            <div class="bg-gray-900 text-white p-8">
              <h1 class="text-3xl font-semibold mb-2">{{ object()!.name }}</h1>
              <p class="text-gray-300">ID: {{ object()!.id }}</p>
            </div>

            <!-- Content -->
            <div class="p-8">
              <!-- Main Info Section -->
              <div class="mb-8">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                    <div class="text-xs text-gray-600 mb-1 font-medium uppercase">Object ID</div>
                    <div class="font-semibold text-gray-900">{{ object()!.id }}</div>
                  </div>
                  <div class="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                    <div class="text-xs text-gray-600 mb-1 font-medium uppercase">Name</div>
                    <div class="font-semibold text-gray-900">{{ object()!.name }}</div>
                  </div>
                </div>
              </div>

              <!-- Data Section -->
              <div class="mb-8">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">Additional Data</h2>
                @if (object()!.data) {
                  <div class="bg-gray-50 border border-gray-200 p-6 rounded-lg">
                    @if (object()!.data!.color) {
                      <div class="mb-4">
                        <div class="text-xs text-gray-600 mb-2 font-medium uppercase">Color</div>
                        <div class="flex items-center">
                          <span class="w-8 h-8 rounded-md border-2 border-gray-300 mr-3" 
                                [style.background-color]="object()!.data!.color"></span>
                          <span class="font-semibold text-gray-900">{{ object()!.data!.color }}</span>
                        </div>
                      </div>
                    }
                    @if (object()!.data!.price) {
                      <div class="mb-4">
                        <div class="text-xs text-gray-600 mb-2 font-medium uppercase">Price</div>
                        <div class="font-semibold text-green-700 text-2xl">
                          \${{ object()!.data!.price }}
                        </div>
                      </div>
                    }
                    
                    <!-- Display all other fields -->
                    @for (key of getDataKeys(); track key) {
                      @if (key !== 'color' && key !== 'price') {
                        <div class="mb-4">
                          <div class="text-xs text-gray-600 mb-2 font-medium uppercase">{{ key }}</div>
                          <div class="font-semibold text-gray-900">{{ object()!.data![key] }}</div>
                        </div>
                      }
                    }
                  </div>
                } @else {
                  <div class="bg-gray-50 border border-gray-200 p-6 rounded-lg text-center text-gray-500">
                    No additional data available
                  </div>
                }
              </div>

              <!-- Raw JSON Section -->
              <div class="mb-8">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">Raw JSON Data</h2>
                <div class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                  <pre class="text-xs font-mono">{{ formatJson(object()!) }}</pre>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-col sm:flex-row gap-3">
                <a [routerLink]="['/objects', object()!.id, 'edit']" 
                   class="flex-1 text-center bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium">
                  Edit Object
                </a>
                <button (click)="confirmDelete()" 
                        class="flex-1 bg-red-600 text-white px-6 py-2.5 rounded-md hover:bg-red-700 transition-colors font-medium"
                        [disabled]="deleting()">
                  {{ deleting() ? 'Deleting...' : 'Delete Object' }}
                </button>
                <a routerLink="/objects" 
                   class="flex-1 text-center bg-gray-100 text-gray-700 px-6 py-2.5 rounded-md hover:bg-gray-200 transition-colors font-medium">
                  Back to List
                </a>
              </div>
            </div>
          </div>
        }

        <!-- Delete Confirmation Modal -->
        @if (showDeleteModal()) {
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
              <h3 class="text-xl font-semibold text-gray-900 mb-3">Confirm Delete</h3>
              <p class="text-gray-600 mb-6">
                Are you sure you want to delete <strong class="text-gray-900">"{{ object()?.name }}"</strong>? This action cannot be undone.
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
export class ObjectDetailComponent implements OnInit {
  object = signal<ApiObject | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  showDeleteModal = signal(false);
  deleting = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private objectsService: ObjectsService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadObject(id);
    } else {
      this.error.set('No object ID provided');
    }
  }

  loadObject(id?: string): void {
    const objectId = id || this.route.snapshot.paramMap.get('id');
    if (!objectId) return;

    this.loading.set(true);
    this.error.set(null);
    
    this.objectsService.getObject(objectId).subscribe({
      next: (data) => {
        this.object.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  getDataKeys(): string[] {
    const data = this.object()?.data;
    return data ? Object.keys(data) : [];
  }

  formatJson(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }

  confirmDelete(): void {
    this.showDeleteModal.set(true);
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
  }

  deleteObject(): void {
    const obj = this.object();
    if (!obj?.id) return;

    this.deleting.set(true);
    
    this.objectsService.deleteObject(obj.id).subscribe({
      next: () => {
        this.router.navigate(['/objects']);
      },
      error: (err) => {
        this.error.set(err.message);
        this.deleting.set(false);
        this.showDeleteModal.set(false);
      }
    });
  }
}
