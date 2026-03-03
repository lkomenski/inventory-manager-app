/**
 * LoginComponent
 *
 * Handles user authentication via email and password.
 *
 * Design note — why DynamicObjectFormComponent instead of a local FormGroup:
 *   Rather than constructing a FormGroup with FormBuilder in every component,
 *   this app delegates form rendering and validation to DynamicObjectFormComponent.
 *   LOGIN_FIELDS (from auth-form-config.ts) declares the fields and their validators;
 *   the component only handles the submitted result and navigation.
 *
 *   This keeps component files thin and form logic centralized, which makes
 *   adjusting validation rules (e.g. tightening password length) a one-line
 *   change in auth-form-config.ts rather than a change across multiple files.
 */

import { Component, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "../../../services/auth-service";
import { DynamicObjectFormComponent } from "../../../forms/dynamic-object-form.component";
import { LOGIN_FIELDS } from "../../../forms/auth-form-config";
import { FormSubmitData, FormConfig } from "../../../forms/field-definition";

@Component({
  selector: "app-auth-login",
  standalone: true,
  imports: [CommonModule, DynamicObjectFormComponent],
  templateUrl: "./login-component.html"
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  /**
   * Field definitions imported from auth-form-config.ts.
   * LOGIN_FIELDS includes: email (required, valid format) and password (required, minLength 6).
   */
  loginFields = LOGIN_FIELDS;

  /**
   * FormConfig tells DynamicObjectFormComponent this is a create-mode form.
   * No initialData is needed for login.
   */
  formConfig: FormConfig = { mode: 'create' };

  /** Prevents double-submit while the auth call is in flight. */
  submitting = signal(false);

  /** Surfaces server-side errors (e.g. "invalid credentials") to the template. */
  serverError = signal<string | null>(null);

  /**
   * Called by DynamicObjectFormComponent's (formSubmit) output.
   * The shared component only emits after all validators pass, so no
   * additional invalid-form guard is needed here.
   */
  onFormSubmit(formData: FormSubmitData): void {
    this.serverError.set(null);
    this.submitting.set(true);

    try {
      this.authService.login(
        formData['email'] as string,
        formData['password'] as string
      );

      this.submitting.set(false);
      // Redirect to the page the user was trying to reach, or fall back to /account
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/account';
      this.router.navigateByUrl(returnUrl);
      console.log('Login successful');
    } catch (err) {
      this.submitting.set(false);
      console.error('Login failed:', err);

      // Distinguish typed Error objects from unknown throws so the message
      // shown to the user is always a readable string.
      if (err instanceof Error) {
        this.serverError.set(err.message);
      } else {
        this.serverError.set('An unexpected error occurred. Please try again later.');
      }
    }
  }

  /** Navigates to the home page if the user cancels login. */
  onFormCancel(): void {
    this.router.navigate(['/']);
  }
}
