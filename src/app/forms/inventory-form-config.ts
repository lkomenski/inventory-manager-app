/**
 * inventory-form-config.ts
 *
 * Field definitions for the inventory object form (Create and Edit pages).
 *
 * INVENTORY_OBJECT_FIELDS covers the fixed fields — name, color, and price.
 * Additional key/value pairs the user adds at runtime are handled separately
 * by DynamicObjectFormComponent's custom fields system, not declared here.
 */

import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';
import { FieldDefinition } from './field-definition';

const priceValidator = (control: AbstractControl): ValidationErrors | null => {
  const val = control.value;
  if (val === null || val === undefined || val === '') return null;
  const decimals = String(val).split('.')[1];
  return decimals && decimals.length > 2 ? { invalidPrice: true } : null;
};

/**
 * Field configuration for inventory object form
 * This includes the standard fields for objects
 */
export const INVENTORY_OBJECT_FIELDS: FieldDefinition[] = [
  {
    name: 'name',
    label: 'Item Name',
    type: 'text',
    placeholder: 'Enter item name',
    validators: [Validators.required, Validators.minLength(3)],
    errors: {
      'required': 'Name is required',
      'minlength': 'Name must be at least 3 characters'
    }
  },
  {
    name: 'color',
    label: 'Color',
    type: 'color',
    value: '#000000',
    optional: true,
    errors: {
      'required': 'Color is required'
    }
  },
  {
    name: 'price',
    label: 'Price',
    type: 'number',
    placeholder: '0.00',
    value: 0,
    min: 0,
    step: 0.01,
    optional: true,
    validators: [priceValidator],
    errors: {
      'min': 'Price cannot be negative',
      'invalidPrice': 'Price can have at most 2 decimal places (e.g. 9.99)'
    }
  }
];
