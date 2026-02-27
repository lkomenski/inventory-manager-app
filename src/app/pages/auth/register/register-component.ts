/**
 * RegisterComponent
 *
 * Handles new user registration.
 *
 * Design note — why DynamicObjectFormComponent instead of a local FormGroup:
 *   The professor's example builds a FormGroup directly inside the component using
 *   FormBuilder. That works fine for a one-off form, but it means every form page
 *   (login, register, create, edit) would duplicate the same reactive-form boilerplate.
 *
 *   Instead, this app uses DynamicObjectFormComponent — a single reusable component
 *   that accepts a FieldDefinition[] array and handles control creation, validation
 *   rendering, and submit/cancel events internally. The component logic here stays
 *   thin: it just declares which fields to show and handles the result.
 *
 * Password confirmation — where the validator lives:
 *   The passwordMatchValidator is defined in auth-form-config.ts and attached to
 *   the passwordConfirmation field via its asyncValidators array. This keeps
 *   validation logic co-located with field configuration rather than scattered
 *   across individual components.
 */

import { Component, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { AuthService } from "../../../services/auth-service";
import { DynamicObjectFormComponent } from "../../../forms/dynamic-object-form.component";
import { REGISTER_FIELDS } from "../../../forms/auth-form-config";
import { FormSubmitData, FormConfig } from "../../../forms/field-definition";

@Component({
  selector: "app-auth-register",
  standalone: true,
  imports: [CommonModule, DynamicObjectFormComponent],
  templateUrl: "./register-component.html"
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  /**
   * Field definitions imported from auth-form-config.ts.
   * REGISTER_FIELDS includes: email, password, passwordConfirmation.
   * The passwordConfirmation field carries an asyncValidator (createPasswordMatchValidator)
   * that compares it against the password field value.
   */
  registerFields = REGISTER_FIELDS;

  /**
   * FormConfig tells DynamicObjectFormComponent this is a create-mode form.
   * No initialData is needed since registration always starts empty.
   */
  formConfig: FormConfig = { mode: 'create' };

  /** Prevents double-submit while the auth call is in flight. */
  submitting = signal(false);

  /** Surfaces server-side errors (e.g. "email already taken") to the template. */
  serverError = signal<string | null>(null);

  /**
   * Called by DynamicObjectFormComponent's (formSubmit) output.
   * DynamicObjectFormComponent only emits when the form passes all validators,
   * so we don't need to call markAllAsTouched() or check form.invalid here —
   * that guard is already enforced by the shared component.
   */
  onFormSubmit(formData: FormSubmitData): void {
    this.serverError.set(null);
    this.submitting.set(true);

    try {
      // Only email + password are passed to register(); passwordConfirmation was
      // only needed for client-side validation and is intentionally omitted here.
      this.authService.register(
        formData['email'] as string,
        formData['password'] as string
      );

      this.submitting.set(false);
      this.router.navigate(['/account']);
      console.log('Registration successful');
    } catch (err) {
      this.submitting.set(false);
      console.error('Registration failed:', err);

      // Distinguish typed Error objects from unknown throws so the message
      // shown to the user is always a readable string.
      if (err instanceof Error) {
        this.serverError.set(err.message);
      } else {
        this.serverError.set('An unexpected error occurred. Please try again later.');
      }
    }
  }

  /** Navigates to the login page if the user cancels registration. */
  onFormCancel(): void {
    this.router.navigate(['/auth/login']);
  }
}