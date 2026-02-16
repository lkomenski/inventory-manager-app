import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ObjectsService } from '../../services/objects.service';

@Component({
  selector: 'app-edit-object',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-4 py-8">
        <!-- Back Button -->
        <div class="mb-6">
          <a [routerLink]="['/objects', objectId()]" 
             class="text-blue-600 hover:text-blue-700 flex items-center gap-2">
            ← Back to Details
          </a>
        </div>

        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-800">Edit Item</h1>
          <p class="text-gray-600 mt-2">Update the details of your inventory item</p>
        </div>

        <!-- Loading State -->
        @if (loading()) {
          <div class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p class="text-gray-600 mt-4 text-lg">Loading item...</p>
          </div>
        }

        <!-- Error State -->
        @if (loadError()) {
          <div class="bg-red-50 border border-red-200 rounded-lg p-6">
            <div class="flex items-center mb-4">
              <svg class="w-6 h-6 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <div>
                <h3 class="font-semibold text-red-800">Error Loading Object</h3>
                <p class="text-red-700">{{ loadError() }}</p>
              </div>
            </div>
            <a routerLink="/objects" 
               class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors inline-block">
              Back to List
            </a>
          </div>
        }

        <!-- Form Card -->
        @if (!loading() && !loadError()) {
          <div class="max-w-2xl bg-white rounded-lg shadow-lg p-8">
            <form [formGroup]="objectForm" (ngSubmit)="onSubmit()">
              <!-- Name Field -->
              <div class="mb-6">
                <label for="name" class="block text-sm font-semibold text-gray-700 mb-2">
                  Item Name <span class="text-red-500">*</span>
                </label>
                <input 
                  id="name"
                  type="text" 
                  formControlName="name"
                  class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  [class.border-red-500]="isFieldInvalid('name')"
                  placeholder="Enter item name">
                
                <!-- Validation Messages -->
                @if (isFieldInvalid('name')) {
                  <div class="mt-2">
                    @if (objectForm.get('name')?.errors?.['required']) {
                      <p class="text-red-600 text-sm flex items-center gap-1">
                        Name is required
                      </p>
                    }
                    @if (objectForm.get('name')?.errors?.['minlength']) {
                      <p class="text-red-600 text-sm flex items-center gap-1">
                        Name must be at least 3 characters long
                      </p>
                    }
                  </div>
                }
              </div>

              <!-- Color Field -->
              <div class="mb-6">
                <label for="color" class="block text-sm font-semibold text-gray-700 mb-2">
                  Color <span class="text-red-500">*</span>
                </label>
                <div class="flex gap-3">
                  <input 
                    id="color"
                    type="color" 
                    formControlName="color"
                    class="h-12 w-20 border rounded-lg cursor-pointer"
                    [class.border-red-500]="isFieldInvalid('color')">
                  <input 
                    type="text" 
                    formControlName="color"
                    class="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    [class.border-red-500]="isFieldInvalid('color')"
                    placeholder="#000000">
                </div>
                
                @if (isFieldInvalid('color')) {
                  <div class="mt-2">
                    @if (objectForm.get('color')?.errors?.['required']) {
                      <p class="text-red-600 text-sm flex items-center gap-1">
                        Color is required
                      </p>
                    }
                  </div>
                }
              </div>

              <!-- Price Field -->
              <div class="mb-6">
                <label for="price" class="block text-sm font-semibold text-gray-700 mb-2">
                  Price <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <span class="absolute left-4 top-3 text-gray-600">$</span>
                  <input 
                    id="price"
                    type="number" 
                    formControlName="price"
                    step="0.01"
                    min="0"
                    class="w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    [class.border-red-500]="isFieldInvalid('price')"
                    placeholder="0.00">
                </div>
                
                @if (isFieldInvalid('price')) {
                  <div class="mt-2">
                    @if (objectForm.get('price')?.errors?.['required']) {
                      <p class="text-red-600 text-sm flex items-center gap-1">
                        Price is required
                      </p>
                    }
                    @if (objectForm.get('price')?.errors?.['min']) {
                      <p class="text-red-600 text-sm flex items-center gap-1">
                        Price must be greater than or equal to 0
                      </p>
                    }
                  </div>
                }
              </div>

              <!-- Error Message -->
              @if (error()) {
                <div class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p class="text-red-700 flex items-center gap-2">
                    {{ error() }}
                  </p>
                </div>
              }

              <!-- Success Message -->
              @if (success()) {
                <div class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <p class="text-green-700 flex items-center gap-2">
                    Item updated successfully!
                  </p>
                </div>
              }

              <!-- Action Buttons -->
              <div class="flex gap-3">
                <button 
                  type="submit"
                  [disabled]="!objectForm.valid || submitting()"
                  class="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-green-700">
                  {{ submitting() ? 'Updating...' : 'Update Item' }}
                </button>
                <a [routerLink]="['/objects', objectId()]" 
                   class="flex-1 text-center bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                  Cancel
                </a>
              </div>

              <!-- Form Status Info -->
              <div class="mt-4 text-sm text-gray-600 text-center">
                @if (!objectForm.valid) {
                  <p>Please fill in all required fields to update the item</p>
                } @else if (objectForm.dirty) {
                  <p>You have unsaved changes</p>
                }
              </div>
            </form>
          </div>
        }
      </div>
    </div>
  `
})
export class EditObjectComponent implements OnInit {
  objectForm: FormGroup;
  objectId = signal<string>('');
  loading = signal(false);
  loadError = signal<string | null>(null);
  submitting = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private objectsService: ObjectsService
  ) {
    this.objectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      color: ['#000000', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.objectId.set(id);
      this.loadObject(id);
    } else {
      this.loadError.set('No object ID provided');
    }
  }

  loadObject(id: string): void {
    this.loading.set(true);
    this.loadError.set(null);
    
    this.objectsService.getObject(id).subscribe({
      next: (data) => {
        // Populate form with existing data
        this.objectForm.patchValue({
          name: data.name,
          color: data.data?.color || '#000000',
          price: data.data?.price || 0
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.loadError.set(err.message);
        this.loading.set(false);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.objectForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.objectForm.invalid) {
      // Mark all fields as touched to show validation messages
      Object.keys(this.objectForm.controls).forEach(key => {
        this.objectForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    this.success.set(false);

    const formValue = this.objectForm.value;
    const updatedObject = {
      name: formValue.name,
      data: {
        color: formValue.color,
        price: formValue.price
      }
    };

    // Using PATCH for partial update (API doesn't support PUT)
    this.objectsService.patchObject(this.objectId(), updatedObject).subscribe({
      next: (updated) => {
        this.success.set(true);
        this.submitting.set(false);
        this.objectForm.markAsPristine();
        // Navigate to the detail page after a short delay
        setTimeout(() => {
          this.router.navigate(['/objects', this.objectId()]);
        }, 1000);
      },
      error: (err) => {
        this.error.set(err.message);
        this.submitting.set(false);
      }
    });
  }
}
