import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ObjectsService } from '../../../services/objects.service';
import { APIRequest } from '../../../models/object.model';
import { DynamicObjectFormComponent, FormSubmitData, FormConfig, INVENTORY_OBJECT_FIELDS } from '../../../forms';

/**
 * Create Product Component
 * 
 * Form page for creating new inventory items.
 * Uses DynamicObjectFormComponent for the actual form UI.
 * On success, navigates to the newly created item's detail page.
 */
@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [CommonModule, RouterLink, DynamicObjectFormComponent],
  templateUrl: './create.component.html'
})
export class CreateProductComponent {
  inventoryFields = INVENTORY_OBJECT_FIELDS;
  
  submitting = signal(false);  
  error = signal<string | null>(null);  
  success = signal(false);  

  formConfig: FormConfig = {
    mode: 'create',
    submitButtonText: 'Create Item',
    cancelButtonText: 'Back to List'
  };

  constructor(
    private router: Router,
    private objectsService: ObjectsService
  ) {
    // console.log('Create Object Component initialized');
  }

  /**
   * Handle form submission from DynamicObjectFormComponent
   * Creates new object via API and navigates to its detail page
   */
  onFormSubmit(formData: FormSubmitData): void {
    // console.log('Form submitted with data:', formData);
    // DEBUGGING BREAKPOINT: Set a breakpoint here to inspect form data
    this.submitting.set(true);
    this.error.set(null);
    this.success.set(false);
    const newObject: APIRequest = {
      name: formData['name'] as string,
      data: {
        color: formData['color'],
        price: formData['price'],
        // Include any custom fields if present
        ...((formData['data'] as any) || {})
      }
    };
    
    // console.log('Creating object:', newObject);

    this.objectsService.createObject(newObject).subscribe({
      next: (created) => {
        // console.log('Product created successfully:', created);
        // console.log('New product ID:', created.id);
        this.success.set(true);
        this.submitting.set(false);
        
        // Navigate to the detail page after a short delay
        setTimeout(() => {
          // console.log('Navigating to product detail page');
          this.router.navigate(['/products', created.id]);
        }, 1000);
      },
      error: (err) => {
        // console.error('Failed to create product:', err);
        this.error.set(err.message);
        this.submitting.set(false);
      }
    });
  }

  /** Navigate back to products list */
  onFormCancel(): void {
    // console.log('Form cancelled, navigating back to list');
    this.router.navigate(['/products']);
  }
}