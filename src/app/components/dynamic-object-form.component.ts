import { Component, Input, Output, EventEmitter, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiObject } from '../models/object.model';

export interface FormSubmitData {
  name: string;
  color: string;
  price: number;
}

export interface FormConfig {
  mode: 'create' | 'edit';
  objectId?: string;
  initialData?: Partial<ApiObject>;
  submitButtonText?: string;
  cancelButtonText?: string;
}

@Component({
  selector: 'app-dynamic-object-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dynamic-object-form.component.html'
})
export class DynamicObjectFormComponent implements OnInit {
  @Input() config: FormConfig = { mode: 'create' };
  @Input() submitting = signal(false);
  @Input() error = signal<string | null>(null);
  @Input() success = signal(false);
  
  @Output() formSubmit = new EventEmitter<FormSubmitData>();
  @Output() formCancel = new EventEmitter<void>();

  objectForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
    this.objectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      color: ['#000000', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]]
    });

    // React to config changes
    effect(() => {
      if (this.config.initialData) {
        this.loadInitialData();
      }
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    if (this.config.initialData) {
      const data = this.config.initialData;
      this.objectForm.patchValue({
        name: data.name || '',
        color: data.data['color'] as string || '#000000',
        price: data.data['price'] as number || 0
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.objectForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string | null {
    const field = this.objectForm.get(fieldName);
    if (!field || !field.errors || !this.isFieldInvalid(fieldName)) {
      return null;
    }

    switch (fieldName) {
      case 'name':
        if (field.errors['required']) return 'Name is required';
        if (field.errors['minlength']) return 'Name must be at least 3 characters long';
        break;
      case 'color':
        if (field.errors['required']) return 'Color is required';
        break;
      case 'price':
        if (field.errors['required']) return 'Price is required';
        if (field.errors['min']) return 'Price must be greater than or equal to 0';
        break;
    }
    return null;
  }

  onSubmit(): void {
    if (this.objectForm.invalid) {
      // Mark all fields as touched to show validation messages
      Object.keys(this.objectForm.controls).forEach(key => {
        this.objectForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.objectForm.value;
    this.formSubmit.emit({
      name: formValue.name,
      color: formValue.color,
      price: formValue.price
    });
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  get submitButtonText(): string {
    if (this.config.submitButtonText) {
      return this.config.submitButtonText;
    }
    const isSubmitting = this.submitting();
    if (this.config.mode === 'edit') {
      return isSubmitting ? 'Updating...' : 'Update Item';
    }
    return isSubmitting ? 'Creating...' : 'Create Item';
  }

  get cancelButtonText(): string {
    return this.config.cancelButtonText || 'Cancel';
  }

  get isEditMode(): boolean {
    return this.config.mode === 'edit';
  }

  get isCreateMode(): boolean {
    return this.config.mode === 'create';
  }
}