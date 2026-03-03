/**
 * auth-form-config.ts
 *
 * Field definitions and validators for the login and registration forms.
 *
 * Centralizing these here means the form structure and validation rules
 * (required, minLength, email format, password match) live in one place.
 * The login and register components import the relevant constant and pass
 * it to DynamicObjectFormComponent — no FormBuilder needed in those components.
 *
 * createPasswordMatchValidator() is an async validator attached to the
 * passwordConfirmation field. It reads the sibling password field via
 * control.parent so it works correctly inside the dynamic form.
 */

import { Validators, AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { FieldDefinition } from './field-definition';

/**
 * Password match validator for registration form
 * Compares passwordConfirmation against password field
 */
export function createPasswordMatchValidator(): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const form = control.parent;
    if (!form) return of(null);

    const password = form.get('password')?.value;
    const passwordConfirmation = control.value;

    if (!password || !passwordConfirmation) return of(null);

    if (password !== passwordConfirmation) {
      return of({ passwordMismatch: true });
    }

    return of(null);
  };
}

/**
 * Field configuration for user login form
 */
export const LOGIN_FIELDS: FieldDefinition[] = [
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'Enter your email',
    validators: [Validators.required, Validators.email],
    errors: {
      'required': 'Email is required',
      'email': 'Enter a valid email address'
    }
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    validators: [Validators.required, Validators.minLength(6)],
    errors: {
      'required': 'Password is required',
      'minlength': 'Password must be at least 6 characters'
    }
  }
];

/**
 * Field configuration for user registration form
 */
export const REGISTER_FIELDS: FieldDefinition[] = [
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'Enter your email',
    validators: [Validators.required, Validators.email],
    errors: {
      'required': 'Email is required',
      'email': 'Enter a valid email address'
    }
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    validators: [Validators.required, Validators.minLength(6)],
    errors: {
      'required': 'Password is required',
      'minlength': 'Password must be at least 6 characters'
    }
  },
  {
    name: 'passwordConfirmation',
    label: 'Confirm Password',
    type: 'password',
    placeholder: 'Confirm your password',
    validators: [Validators.required, Validators.minLength(6)],
    asyncValidators: [createPasswordMatchValidator()],
    errors: {
      'required': 'Please confirm your password',
      'minlength': 'Password must be at least 6 characters',
      'passwordMismatch': 'Passwords do not match'
    }
  }
];
