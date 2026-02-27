import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ObjectsService } from '../../../services/objects.service';
import { ApiObject, APIRequest } from '../../../models/object.model';
import { DynamicObjectFormComponent, FormSubmitData, FormConfig, INVENTORY_OBJECT_FIELDS } from '../../../forms';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule, RouterLink, DynamicObjectFormComponent],
  templateUrl: './edit.component.html'
})
export class EditProductComponent implements OnInit {
  inventoryFields = INVENTORY_OBJECT_FIELDS;
  objectId = signal<string>('');
  loading = signal(false);
  loadError = signal<string | null>(null);
  submitting = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  objectData = signal<ApiObject | null>(null);

  formConfig: FormConfig = {
    mode: 'edit',
    submitButtonText: 'Update Item',
    cancelButtonText: 'Back to Details'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private objectsService: ObjectsService
  ) {
    // console.log('Edit Product Component initialized');
  }

  ngOnInit(): void {
    // console.log('Edit Product Component: ngOnInit called');
    const id = this.route.snapshot.paramMap.get('id');
    // console.log('Product ID from route:', id);
    if (id) {
      this.objectId.set(id);
      this.formConfig.objectId = id;
      this.loadProduct(id);
    } else {
      // console.error('No product ID provided in route');
      this.loadError.set('No product ID provided');
    }
  }

  loadProduct(id: string): void {
    // console.log('Loading product for editing, ID:', id);
    // DEBUGGING BREAKPOINT: Set a breakpoint here to debug product loading
    this.loading.set(true);
    this.loadError.set(null);
    
    this.objectsService.getObject(id).subscribe({
      next: (data) => {
        // console.log('Product loaded for editing:', data);
        this.objectData.set(data);
        // Update the form config with the loaded data
        this.formConfig = {
          ...this.formConfig,
          initialData: data
        };
        // console.log('Form initialized with data');
        this.loading.set(false);
      },
      error: (err) => {
        // console.error('Failed to load product:', err);
        this.loadError.set(err.message);
        this.loading.set(false);
      }
    });
  }

  onFormSubmit(formData: FormSubmitData): void {
    // console.log('Edit form submitted with data:', formData);
    // console.log('Updating product ID:', this.objectId());
    // DEBUGGING BREAKPOINT: Set a breakpoint here to inspect form data
    this.submitting.set(true);
    this.error.set(null);
    this.success.set(false);

    const updatedObject: APIRequest = {
      name: formData['name'] as string,
      data: {
        color: formData['color'],
        price: formData['price'],
        // Include any custom fields if present
        ...((formData['data'] as any) || {})
      }
    };
    
    // console.log('Update payload:', updatedObject);

    // Using PUT for full replacement
    this.objectsService.updateObject(this.objectId(), updatedObject).subscribe({
      next: (updated) => {
        // console.log('Product updated successfully:', updated);
        this.success.set(true);
        this.submitting.set(false);
        // Navigate to the detail page after a short delay
        setTimeout(() => {
          // console.log('Navigating to product detail page');
          this.router.navigate(['/products', this.objectId()]);
        }, 1000);
      },
      error: (err: any) => {
        // console.error('Failed to update product:', err);
        this.error.set(err.message);
        this.submitting.set(false);
      }
    });
  }

  onFormCancel(): void {
    // console.log('Form cancelled, navigating back to detail page');
    this.router.navigate(['/products', this.objectId()]);
  }
}