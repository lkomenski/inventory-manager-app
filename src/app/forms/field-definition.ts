/**
 * field-definition.ts
 *
 * Shared TypeScript interfaces for the dynamic form system.
 *
 * FieldDefinition describes a single form field — its type, validators, and
 * error messages. Arrays of FieldDefinition are passed to DynamicObjectFormComponent
 * to generate forms without repeating reactive-form boilerplate per page.
 *
 * FormConfig controls the form's mode (create / edit / view) and optional
 * pre-population data used when editing an existing object.
 *
 * FormSubmitData is the plain object emitted on successful submission.
 */

import { ValidatorFn, AsyncValidatorFn } from '@angular/forms';

/**
 * Error message mapping for a field
 * Maps error type to user-friendly message
 */
export interface ErrorMessage {
  [errorType: string]: string;
}

/**
 * Configuration for a single form field
 * Supports text, email, password, number, etc.
 */
export interface FieldDefinition {
  name: string;                           // Field name (used in form control)
  label: string;                          // Display label
  type: 'text' | 'email' | 'password' | 'number' | 'color' | 'textarea';  // HTML input type
  value?: string | number;                // Initial value
  placeholder?: string;                   // Placeholder text
  validators?: ValidatorFn[];             // Synchronous validators
  asyncValidators?: AsyncValidatorFn[];   // Asynchronous validators
  errors?: ErrorMessage;                  // Custom error messages
  optional?: boolean;                     // If true, field is not required
  min?: number;                           // For number/range inputs
  max?: number;                           // For number/range inputs
  step?: number | string;                 // For number inputs
  rows?: number;                          // For textarea
  cols?: number;                          // For textarea
  disabled?: boolean;                     // If true, field is disabled
  hidden?: boolean;                       // If true, field is hidden
}

/**
 * Configuration for form with dynamic fields
 */
export interface FormConfig {
  mode: 'create' | 'edit' | 'view';       // Form mode
  objectId?: string;                      // ID when editing
  submitButtonText?: string;              // Custom submit button text
  cancelButtonText?: string;              // Custom cancel button text
  initialData?: { [key: string]: any };   // Pre-populate form
}

/**
 * Data structure emitted when form is submitted
 */
export interface FormSubmitData {
  [key: string]: any;
}
