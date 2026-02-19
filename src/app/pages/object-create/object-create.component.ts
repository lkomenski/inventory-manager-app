import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ObjectsService } from '../../services/objects.service';
import { APIRequest } from '../../models/object.model';
import { DynamicObjectFormComponent, FormSubmitData, FormConfig } from '../../components';

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
  ) {}

  onFormSubmit(formData: FormSubmitData): void {
    this.submitting.set(true);
    this.error.set(null);
    this.success.set(false);

    const newObject: APIRequest = {
      name: formData.name,
      data: formData.data
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

  onFormCancel(): void {
    this.router.navigate(['/objects']);
  }
}