import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ObjectsService } from '../../services/objects.service';
import { ApiObject, APIRequest } from '../../models/object.model';
import { DynamicObjectFormComponent, FormSubmitData, FormConfig } from '../../components';

@Component({
  selector: 'app-object-edit',
  standalone: true,
  imports: [CommonModule, RouterLink, DynamicObjectFormComponent],
  templateUrl: './object-edit.component.html'
})
export class EditObjectComponent implements OnInit {
  objectId = signal<string>('');
  loading = signal(false);
  loadError = signal<string | null>(null);
  submitting = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  objectData = signal<ApiObject | null>(null);

  formConfig: FormConfig = {
    mode: 'edit',
    submitButtonText: undefined, // Will use default
    cancelButtonText: 'Back to Details'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private objectsService: ObjectsService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.objectId.set(id);
      this.formConfig.objectId = id;
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
        this.objectData.set(data);
        // Update the form config with the loaded data
        this.formConfig = {
          ...this.formConfig,
          initialData: data
        };
        this.loading.set(false);
      },
      error: (err) => {
        this.loadError.set(err.message);
        this.loading.set(false);
      }
    });
  }

  onFormSubmit(formData: FormSubmitData): void {
    this.submitting.set(true);
    this.error.set(null);
    this.success.set(false);

    const updatedObject: APIRequest = {
      name: formData.name,
      data: formData.data
    };

    // Using PUT for full replacement
    this.objectsService.updateObject(this.objectId(), updatedObject).subscribe({
      next: (updated) => {
        this.success.set(true);
        this.submitting.set(false);
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

  onFormCancel(): void {
    this.router.navigate(['/objects', this.objectId()]);
  }
}