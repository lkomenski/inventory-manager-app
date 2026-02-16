import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ObjectsService } from '../../services/objects.service';

@Component({
  selector: 'app-create-object',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
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

        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-semibold text-gray-900 mb-2">Create New Item</h1>
          <p class="text-gray-600">Fill in the details to add a new item to your inventory</p>
        </div>

        <!-- Form Card -->
        <div class="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm p-8">
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
                class="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                [class.border-red-500]="isFieldInvalid('name')"
                placeholder="Enter item name">
              
              <!-- Validation Messages -->
              @if (isFieldInvalid('name')) {
                <div class="mt-2">
                  @if (objectForm.get('name')?.errors?.['required']) {
                    <p class="text-red-600 text-sm">
                      Name is required
                    </p>
                  }
                  @if (objectForm.get('name')?.errors?.['minlength']) {
                    <p class="text-red-600 text-sm">
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
                  class="h-11 w-20 border border-gray-300 rounded-md cursor-pointer"
                  [class.border-red-500]="isFieldInvalid('color')">
                <input 
                  type="text" 
                  formControlName="color"
                  class="flex-1 px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  [class.border-red-500]="isFieldInvalid('color')"
                  placeholder="#000000">
              </div>
              
              @if (isFieldInvalid('color')) {
                <div class="mt-2">
                  @if (objectForm.get('color')?.errors?.['required']) {
                    <p class="text-red-600 text-sm">
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
                <span class="absolute left-4 top-2.5 text-gray-600 font-medium">$</span>
                <input 
                  id="price"
                  type="number" 
                  formControlName="price"
                  step="0.01"
                  min="0"
                  class="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  [class.border-red-500]="isFieldInvalid('price')"
                  placeholder="0.00">
              </div>
              
              @if (isFieldInvalid('price')) {
                <div class="mt-2">
                  @if (objectForm.get('price')?.errors?.['required']) {
                    <p class="text-red-600 text-sm">
                      Price is required
                    </p>
                  }
                  @if (objectForm.get('price')?.errors?.['min']) {
                    <p class="text-red-600 text-sm">
                      Price must be greater than or equal to 0
                    </p>
                  }
                </div>
              }
            </div>

            <!-- Error Message -->
            @if (error()) {
              <div class="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <p class="text-red-700 text-sm">
                  {{ error() }}
                </p>
              </div>
            }

            <!-- Success Message -->
            @if (success()) {
              <div class="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                <p class="text-green-700 text-sm">
                  Item created successfully!
                </p>
              </div>
            }

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3">
              <button 
                type="submit"
                [disabled]="!objectForm.valid || submitting()"
                class="flex-1 bg-blue-600 text-white px-6 py-2.5 rounded-md font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700">
                {{ submitting() ? 'Creating...' : 'Create Item' }}
              </button>
              <a routerLink="/objects" 
                 class="flex-1 text-center bg-gray-100 text-gray-700 px-6 py-2.5 rounded-md font-medium hover:bg-gray-200 transition-colors">
                Cancel
              </a>
            </div>

            <!-- Form Status Info -->
            <div class="mt-4 text-sm text-gray-600 text-center">
              @if (!objectForm.valid) {
                <p>Please fill in all required fields to create the item</p>
              }
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class CreateObjectComponent {
  objectForm: FormGroup;
  submitting = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private objectsService: ObjectsService
  ) {
    this.objectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      color: ['#000000', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]]
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
    const newObject = {
      name: formValue.name,
      data: {
        color: formValue.color,
        price: formValue.price
      }
    };

    this.objectsService.createObject(newObject).subscribe({
      next: (created) => {
        this.success.set(true);
        this.submitting.set(false);
        // Navigate to the detail page after a short delay
        setTimeout(() => {
          this.router.navigate(['/objects', created.id]);
        }, 1000);
      },
      error: (err) => {
        this.error.set(err.message);
        this.submitting.set(false);
      }
    });
  }
}
