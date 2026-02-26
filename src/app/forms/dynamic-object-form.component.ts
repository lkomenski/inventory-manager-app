import { Component, Input, Output, EventEmitter, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ApiObject } from '../models/object.model';
import { ObjectsService } from '../services/objects.service';

/**
 * Data structure emitted when form is submitted
 */
export interface FormSubmitData {
  name: string;
  data: {
    [key: string]: string | number;
  };
}

/**
 * Represents a custom field added by the user
 */
export interface CustomField {
  key: string;               // Field name
  value: string | number;    // Field value
  type: 'text' | 'number';   // Data type
  isCustomName: boolean;     // true if user typed custom name, false if selected from suggestions
}

/**
 * Field suggestions loaded from existing API data
 */
export interface FieldSuggestion {
  name: string;               // Field name (e.g., "CPU model", "year")
  type: 'text' | 'number';    // Detected data type
  example?: string | number;  // Example value from existing data
}

/**
 * Configuration options for the form
 */
export interface FormConfig {
  mode: 'create' | 'edit';       // Determines form behavior and validation
  objectId?: string;              // Required when mode is 'edit'
  initialData?: Partial<ApiObject>;  // Pre-populate form with existing data
  submitButtonText?: string;      // Custom button text (defaults based on mode)
  cancelButtonText?: string;      // Custom cancel button text
}

/**
 * Dynamic Object Form Component
 * 
 * Reusable form component for creating and editing inventory objects.
 * Features:
 * - Fixed fields: name (required), color, price
 * - Dynamic custom fields with smart suggestions from existing data
 * - Validates input and provides real-time feedback
 * - Works for both create and edit modes
 */
@Component({
  selector: 'app-dynamic-object-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './dynamic-object-form.component.html'
})
export class DynamicObjectFormComponent implements OnInit {
  @Input() config: FormConfig = { mode: 'create' };
  @Input() submitting = signal(false);   // Parent controls submitting state
  @Input() error = signal<string | null>(null);  // Error message from parent
  @Input() success = signal(false);      // Success state from parent
  
  @Output() formSubmit = new EventEmitter<FormSubmitData>();  // Emit validated form data
  @Output() formCancel = new EventEmitter<void>();            // Emit cancel action

  objectForm: FormGroup;             // Reactive form for name, color, price
  customFields: CustomField[] = [];  // Dynamic user-added fields
  fieldSuggestions: FieldSuggestion[] = [];  // Suggestions loaded from existing objects
  loadingSuggestions = signal(false);
  
  constructor(
    private fb: FormBuilder,
    private objectsService: ObjectsService
  ) {
    // Initialize form with fixed fields
    this.objectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      color: ['#000000'],  // Default to black
      price: [0, [Validators.min(0)]]  // Must be non-negative
    });

    // React to config changes (for edit mode)
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
  
  /**
   * Load field suggestions from existing API objects
   * This creates a smart dropdown of commonly used field names
   */
  private loadFieldSuggestionsFromAPI(): void {
    this.loadingSuggestions.set(true);
    
    this.objectsService.getObjects().subscribe({
      next: (objects) => {
        const fieldMap = new Map<string, { type: 'text' | 'number', example: string | number }>();
        
        // Extract all unique field names from all objects in the API
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
        
        // Convert map to array and sort alphabetically for dropdown
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

  /**
   * Load initial data when editing an existing object
   * Populates fixed fields and recreates custom fields
   */
  private loadInitialData(): void {
    if (this.config.initialData) {
      const data = this.config.initialData;
      
      // Populate fixed fields
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
              isCustomName: !isKnownField  // Mark if this field isn't in suggestions
            });
          }
        });
      }
    }
  }

  /**
   * Check if a form field has validation errors and has been touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.objectForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Get user-friendly error message for a field
   */
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

  /**
   * Handle form submission
   * Validates and emits combined data from fixed and custom fields
   */
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
    
    // Add custom fields (only if they have both key and value)
    this.customFields.forEach(field => {
      if (field.key && field.value !== null && field.value !== undefined && field.value !== '') {
        data[field.key] = field.value;
      }
    });
    
    // Emit to parent component
    this.formSubmit.emit({
      name: formValue.name,
      data: data
    });
  }
  
  /**
   * Add a new blank custom field row
   */
  addCustomField(): void {
    this.customFields.push({
      key: '',
      value: '',
      type: 'text',
      isCustomName: false
    });
  }
  
  /**
   * Remove a custom field by index
   */
  removeCustomField(index: number): void {
    this.customFields.splice(index, 1);
  }
  
  /**
   * Handle field name selection/change
   * Auto-configures field type based on suggestions
   */
  onFieldNameChange(index: number, fieldName: string): void {
    const field = this.customFields[index];
    field.key = fieldName;
    
    // Check if this is a suggested field
    const suggestion = this.fieldSuggestions.find(s => s.name === fieldName);
    if (suggestion) {
      // Auto-set type based on suggestion
      field.type = suggestion.type;
      field.isCustomName = false;
      
      // Optionally set example value if field value is empty
      if (!field.value && suggestion.example !== undefined) {
        field.value = suggestion.type === 'number' ? 0 : '';
      }
    } else if (fieldName === '_custom_') {
      // User selected \"Custom field name...\" option
      field.key = '';
      field.isCustomName = true;
    } else if (fieldName && fieldName !== '_custom_') {
      // User typed a custom field name
      field.isCustomName = true;
    }
  }
  
  /**
   * Get list of available field suggestions for a dropdown
   * Filters out fields already in use by other custom fields
   */
  getAvailableSuggestions(currentIndex: number): FieldSuggestion[] {
    // Filter out fields already used by other custom fields (except current one)
    const usedFields = this.customFields
      .map((f, idx) => idx !== currentIndex ? f.key : null)
      .filter(key => key && key !== '_custom_');
    
    return this.fieldSuggestions.filter(s => !usedFields.includes(s.name));
  }
  
  /**
   * Update field type and convert value accordingly
   * Ensures value matches the selected type
   */
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
  
  /**
   * Check if a custom field name is invalid (empty or placeholder)
   * Used for validation styling
   */
  isFieldNameInvalid(index: number): boolean {
    const field = this.customFields[index];
    return !field.key || field.key === '_custom_';
  }
  
  /**
   * Track by function for @for loop optimization
   * Helps Angular efficiently render the list
   */
  trackByIndex(index: number): number {
    return index;
  }

  /**
   * Handle cancel button click
   */
  onCancel(): void {
    this.formCancel.emit();
  }

  /**
   * Get dynamic submit button text based on mode and state
   */
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

  /**
   * Get cancel button text (uses default or custom)
   */
  get cancelButtonText(): string {
    return this.config.cancelButtonText || 'Cancel';
  }

  // Mode checkers for template conditionals
  get isEditMode(): boolean {
    return this.config.mode === 'edit';
  }

  get isCreateMode(): boolean {
    return this.config.mode === 'create';
  }
}