/**
 * dynamic-object-form.component.ts
 *
 * A single reusable form component that drives every form in the app —
 * login, register, create item, and edit item.
 *
 * Rather than building a separate FormGroup in each page component, callers
 * pass a FieldDefinition[] array (from auth-form-config or inventory-form-config)
 * and this component handles control creation, validation, error display,
 * and submission. The parent only receives a clean FormSubmitData object
 * via the (formSubmit) output after all validators pass.
 *
 * For inventory pages, enableCustomFields unlocks an additional section
 * where users can add arbitrary key/value pairs to the object's data object.
 * Field name suggestions are loaded live from the public API so common
 * property names (year, capacity, CPU model, etc.) appear in a dropdown
 * with auto-detected types.
 */

import { Component, Input, Output, EventEmitter, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ApiObject } from '../models/object.model';
import { ObjectsService } from '../services/objects.service';
import { FieldDefinition, FormConfig, FormSubmitData } from './field-definition';

/**
 * Represents a custom field added by the user at runtime.
 * isCustomName distinguishes free-text keys from dropdown selections.
 */
export interface CustomField {
  key: string;               // Field name
  value: string | number;    // Field value
  type: 'text' | 'number';   // Data type
  isCustomName: boolean;     // true if user typed custom name, false if selected from suggestions
}

/**
 * A field name + type hint pulled from existing API objects.
 * Shown in the custom field dropdown so users can reuse real property names.
 */
export interface FieldSuggestion {
  name: string;               // Field name (e.g., "CPU model", "year")
  type: 'text' | 'number';    // Detected data type
  example?: string | number;  // Example value from existing data
}

/**
 * Generic Dynamic Form Component
 * 
 * Reusable form component that adapts to any field configuration.
 * Features:
 * - Accepts field definitions to generate form controls
 * - Supports text, email, password, number, color, textarea inputs
 * - Built-in validation with custom error messages
 * - Optional custom fields (for inventory items)
 * - Works for create, edit, and view modes
 */
@Component({
  selector: 'app-dynamic-object-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './dynamic-object-form.component.html'
})
export class DynamicObjectFormComponent implements OnInit {
  @Input() fields: FieldDefinition[] = [];  // Field definitions for generic forms
  @Input() config: FormConfig = { mode: 'create' };
  @Input() submitting = signal(false);      // Parent controls submitting state
  @Input() error = signal<string | null>(null);   // Error message from parent
  @Input() success = signal(false);         // Success state from parent
  @Input() enableCustomFields = false;      // Enable custom fields for inventory items
  
  @Output() formSubmit = new EventEmitter<FormSubmitData>();  // Emit validated form data
  @Output() formCancel = new EventEmitter<void>();            // Emit cancel action

  dynamicForm: FormGroup;            // Reactive form based on field definitions
  customFields: CustomField[] = [];  // Dynamic user-added fields (for inventory)
  fieldSuggestions: FieldSuggestion[] = [];  // Suggestions from existing objects
  loadingSuggestions = signal(false);
  
  constructor(
    private fb: FormBuilder,
    private objectsService: ObjectsService
  ) {
    this.dynamicForm = this.fb.group({});

    // React to config changes (for edit mode)
    effect(() => {
      if (this.config.initialData) {
        this.loadInitialData();
      }
    });
  }

  ngOnInit(): void {
    this.buildFormFromFields();
    this.loadInitialData();
    
    // Load suggestions only if custom fields are enabled (inventory mode)
    if (this.enableCustomFields) {
      this.loadFieldSuggestionsFromAPI();
    }
  }
  
  /**
   * Build the reactive FormGroup from the FieldDefinition array.
   * Each field's validators and asyncValidators are applied here so
   * neither the parent component nor the template needs to touch FormBuilder.
   */
  private buildFormFromFields(): void {
    const group: { [key: string]: any } = {};
    
    this.fields.forEach(field => {
      const validators: ValidatorFn[] = [];
      const asyncValidators: AsyncValidatorFn[] = [];
      
      // Add required validator if field is not optional
      if (!field.optional) {
        validators.push(Validators.required);
      }
      
      // Add custom validators from field definition
      if (field.validators) {
        validators.push(...field.validators);
      }
      
      // Add async validators
      if (field.asyncValidators) {
        asyncValidators.push(...field.asyncValidators);
      }
      
      // Create form control with validators
      const value = field.value ?? '';
      group[field.name] = [
        value,
        validators.length > 0 ? validators : null,
        asyncValidators.length > 0 ? asyncValidators : null
      ];
    });
    
    this.dynamicForm = this.fb.group(group);
  }
  
  /**
   * Fetch all objects from the API and extract unique field names from their
   * data objects. Used to populate the custom field name dropdown with
   * real property names and auto-detected types (text vs. number).
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
   * Patch form controls and restore custom fields when editing an existing object.
   * Handles both flat structures (auth forms) and nested data objects (inventory items).
   */
  private loadInitialData(): void {
    if (this.config.initialData) {
      const data: any = this.config.initialData;
      
      // For inventory objects with nested data structure
      if ('data' in data && typeof data['data'] === 'object') {
        // Populate main fields
        const formData: { [key: string]: any } = {};
        
        // Populate from top-level properties
        this.fields.forEach(field => {
          if (field.name in data) {
            formData[field.name] = data[field.name];
          }
        });
        
        this.dynamicForm.patchValue(formData);
        
        // Load custom fields from nested data object
        if (this.enableCustomFields && data['data']) {
          this.customFields = [];
          Object.entries(data['data']).forEach(([key, value]: [string, any]) => {
            // Skip if this field is already a main form field
            if (this.fields.some(f => f.name === key)) {
              return;
            }
            
            const fieldType = typeof value === 'number' ? 'number' : 'text';
            const isKnownField = this.fieldSuggestions.some(s => s.name === key);
            
            this.customFields.push({
              key,
              value: value as string | number,
              type: fieldType,
              isCustomName: !isKnownField
            });
          });
        }
      } else {
        // For simple data structures (like auth forms)
        this.dynamicForm.patchValue(data);
      }
    }
  }

  /** Returns true when a field has been interacted with and fails validation. */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.dynamicForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Returns the first matching error message for a field.
   * Checks the FieldDefinition's custom error map before falling back
   * to generic messages for standard Angular validator errors.
   */
  getFieldError(fieldName: string): string | null {
    const field = this.dynamicForm.get(fieldName);
    if (!field || !field.errors || !this.isFieldInvalid(fieldName)) {
      return null;
    }

    // Get field definition for custom error messages
    const fieldDef = this.fields.find(f => f.name === fieldName);
    
    // Check for custom error messages first
    if (fieldDef?.errors) {
      for (const [errorType, message] of Object.entries(fieldDef.errors)) {
        if (field.errors[errorType]) {
          return message;
        }
      }
    }

    // Fallback to generic messages
    if (field.errors['required']) return 'This field is required';
    if (field.errors['email']) return 'Enter a valid email address';
    if (field.errors['minlength']) {
      const minLength = field.errors['minlength'].requiredLength;
      return `Must be at least ${minLength} characters`;
    }
    if (field.errors['min']) {
      const min = field.errors['min'].min;
      return `Must be at least ${min}`;
    }
    if (field.errors['max']) {
      const max = field.errors['max'].max;
      return `Must not exceed ${max}`;
    }
    
    return 'Invalid value';
  }

  onSubmit(): void {
    if (this.dynamicForm.invalid) {
      // Mark all fields as touched to show validation messages
      Object.keys(this.dynamicForm.controls).forEach(key => {
        this.dynamicForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formData: FormSubmitData = { ...this.dynamicForm.value };
    
    // Add custom fields if enabled
    if (this.enableCustomFields && this.customFields.length > 0) {
      // Create nested data object for inventory items
      const data: { [key: string]: string | number } = {};
      
      this.customFields.forEach(field => {
        if (field.key && field.value !== null && field.value !== undefined && field.value !== '') {
          data[field.key] = field.value;
        }
      });
      
      // Restructure to match inventory format
      formData['data'] = data;
    }
    
    // Emit to parent component
    this.formSubmit.emit(formData);
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
      return isSubmitting ? 'Updating...' : 'Update';
    }
    return isSubmitting ? 'Submitting...' : 'Submit';
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

  get isViewMode(): boolean {
    return this.config.mode === 'view';
  }
}