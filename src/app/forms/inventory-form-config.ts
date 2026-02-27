import { Validators } from '@angular/forms';
import { FieldDefinition } from './field-definition';

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
    errors: {
      'min': 'Price must be greater than or equal to 0'
    }
  }
];
