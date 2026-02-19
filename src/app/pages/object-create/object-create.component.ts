import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ObjectsService } from '../../services/objects.service';
import { APIRequest } from '../../models/object.model';
import { DynamicObjectFormComponent, FormSubmitData, FormConfig } from '../../components';
import { AccountComponent } from '../account/account.component';

@Component({
  selector: 'app-object-create',
  standalone: true,
  imports: [CommonModule, RouterLink, DynamicObjectFormComponent],
  templateUrl: './object-create.component.html'
})
export class CreateObjectComponent {
  submitting = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  formConfig: FormConfig = {
    mode: 'create',
    submitButtonText: undefined, // Will use default
    cancelButtonText: 'Back to List'
  };

  constructor(
    private router: Router,
    private objectsService: ObjectsService
  ) {
    // console.log('Create Object Component initialized');
  }

  onFormSubmit(formData: FormSubmitData): void {
    // console.log('Form submitted with data:', formData);
    // DEBUGGING BREAKPOINT: Set a breakpoint here to inspect form data
    this.submitting.set(true);
    this.error.set(null);
    this.success.set(false);

    const newObject: APIRequest = {
      name: formData.name,
      data: formData.data
    };
    
    // console.log('Creating object:', newObject);

    this.objectsService.createObject(newObject).subscribe({
      next: (created) => {
        // console.log('Object created successfully:', created);
        // console.log('New object ID:', created.id);
        this.success.set(true);
        this.submitting.set(false);
        
        // Log activity
        AccountComponent.logActivity('Created item', formData.name, '✨');
        
        // Navigate to the detail page after a short delay
        setTimeout(() => {
          // console.log('Navigating to object detail page');
          this.router.navigate(['/objects', created.id]);
        }, 1000);
      },
      error: (err) => {
        // console.error('Failed to create object:', err);
        this.error.set(err.message);
        this.submitting.set(false);
      }
    });
  }

  onFormCancel(): void {
    // console.log('Form cancelled, navigating back to list');
    this.router.navigate(['/objects']);
  }
}