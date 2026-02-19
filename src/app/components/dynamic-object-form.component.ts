import { Component, Input, Output, EventEmitter, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ApiObject } from '../models/object.model';
import { ObjectsService } from '../services/objects.service';

export interface FormSubmitData {
  name: string;
  data: {
    [key: string]: string | number;
  };
}

export interface CustomField {
  key: string;
  value: string | number;
  type: 'text' | 'number';
  isCustomName: boolean; // true if user typed a custom name not in suggestions
}

export interface FieldSuggestion {
  name: string;
  type: 'text' | 'number';
  example?: string | number;
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
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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
  customFields: CustomField[] = [];
  fieldSuggestions: FieldSuggestion[] = [];
  loadingSuggestions = signal(false);
  
  constructor(
    private fb: FormBuilder,
    private objectsService: ObjectsService
  ) {
    this.objectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      color: ['#000000'],
      price: [0, [Validators.min(0)]]
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
    this.loadFieldSuggestionsFromAPI();
  }
  
  private loadFieldSuggestionsFromAPI(): void {
    this.loadingSuggestions.set(true);
    
    this.objectsService.getObjects().subscribe({
      next: (objects) => {
        const fieldMap = new Map<string, { type: 'text' | 'number', example: string | number }>();
        
        // Extract all unique field names from all objects
        objects.forEach(obj => {
          if (obj.data) {
            Object.entries(obj.data).forEach(([key, value]) => {
              // Skip color and price as they have dedicated fields
              if (key === 'color' || key === 'price' || key === 'Color' || key === 'Price') {
                return;
              }
              
              // Only add the first occurrence of each field name
              if (!fieldMap.has(key)) {
                const type = typeof value === 'number' ? 'number' : 'text';
                fieldMap.set(key, { type, example: value });
              }
            });
          }
        });
        
        // Convert map to array and sort alphabetically
        this.fieldSuggestions = Array.from(fieldMap.entries())
          .map(([name, { type, example }]) => ({ name, type, example }))
          .sort((a, b) => a.name.localeCompare(b.name));
        
        this.loadingSuggestions.set(false);
      },
      error: (err) => {
        console.error('Failed to load field suggestions:', err);
        // Fallback to empty suggestions if API call fails
        this.fieldSuggestions = [];
        this.loadingSuggestions.set(false);
      }
    });
  }

  private loadInitialData(): void {
    if (this.config.initialData) {
      const data = this.config.initialData;
      this.objectForm.patchValue({
        name: data.name || '',
        color: (data.data?.['color'] as string) || '#000000',
        price: (data.data?.['price'] as number) || 0
      });
      
      // Load custom fields from existing data
      if (data.data) {
        this.customFields = [];
        Object.keys(data.data).forEach(key => {
          // Skip color and price since they have dedicated fields
          if (key !== 'color' && key !== 'price') {
            const value = data.data![key];
            const fieldType = typeof value === 'number' ? 'number' : 'text';
            const isKnownField = this.fieldSuggestions.some(s => s.name === key);
            
            this.customFields.push({
              key: key,
              value: value,
              type: fieldType,
              isCustomName: !isKnownField
            });
          }
        });
      }
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
      case 'price':
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
    const data: { [key: string]: string | number } = {};
    
    // Add standard fields if they have values
    if (formValue.color) {
      data['color'] = formValue.color;
    }
    if (formValue.price !== null && formValue.price !== undefined && formValue.price !== '') {
      data['price'] = formValue.price;
    }
    
    // Add custom fields
    this.customFields.forEach(field => {
      if (field.key && field.value !== null && field.value !== undefined && field.value !== '') {
        data[field.key] = field.value;
      }
    });
    
    this.formSubmit.emit({
      name: formValue.name,
      data: data
    });
  }
  
  addCustomField(): void {
    this.customFields.push({
      key: '',
      value: '',
      type: 'text',
      isCustomName: false
    });
  }
  
  removeCustomField(index: number): void {
    this.customFields.splice(index, 1);
  }
  
  onFieldNameChange(index: number, fieldName: string): void {
    const field = this.customFields[index];
    field.key = fieldName;
    
    // Check if this is a suggested field
    const suggestion = this.fieldSuggestions.find(s => s.name === fieldName);
    if (suggestion) {
      // Auto-set type based on suggestion
      field.type = suggestion.type;
      field.isCustomName = false;
      
      // Set example value if field value is empty
      if (!field.value && suggestion.example !== undefined) {
        field.value = suggestion.type === 'number' ? 0 : '';
      }
    } else if (fieldName === '_custom_') {
      // User selected "Custom field name..."
      field.key = '';
      field.isCustomName = true;
    } else if (fieldName && fieldName !== '_custom_') {
      // User typed a custom field name
      field.isCustomName = true;
    }
  }
  
  getAvailableSuggestions(currentIndex: number): FieldSuggestion[] {
    // Filter out fields already used by other custom fields (except current one)
    const usedFields = this.customFields
      .map((f, idx) => idx !== currentIndex ? f.key : null)
      .filter(key => key && key !== '_custom_');
    
    return this.fieldSuggestions.filter(s => !usedFields.includes(s.name));
  }
  
  updateFieldType(index: number, type: 'text' | 'number'): void {
    this.customFields[index].type = type;
    // Convert value to appropriate type
    if (type === 'number') {
      const numValue = Number(this.customFields[index].value);
      this.customFields[index].value = isNaN(numValue) ? 0 : numValue;
    } else {
      this.customFields[index].value = String(this.customFields[index].value);
    }
  }
  
  isFieldNameInvalid(index: number): boolean {
    const field = this.customFields[index];
    return !field.key || field.key === '_custom_';
  }
  
  trackByIndex(index: number): number {
    return index;
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