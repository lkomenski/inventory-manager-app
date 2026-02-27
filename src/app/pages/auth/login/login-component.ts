import { Component, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
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

  loginFields = LOGIN_FIELDS;
  formConfig: FormConfig = { mode: 'create' };
  submitting = signal(false);
  serverError = signal<string | null>(null);

  onFormSubmit(formData: FormSubmitData): void {
    this.serverError.set(null);
    this.submitting.set(true);

    try {
      this.authService.login(
        formData['email'] as string,
        formData['password'] as string
      );
      
      this.submitting.set(false);
      // Redirect to account/dashboard after successful login
      this.router.navigate(['/account']);
    } catch (err) {
      this.submitting.set(false);
      console.error("Login error", err);
      
      if (err instanceof Error) {
        this.serverError.set(err.message);
      } else {
        this.serverError.set('An unexpected error occurred. Please try again later.');
      }
    }
  }

  onFormCancel(): void {
    // Handle cancel - navigate back or go to home
    this.router.navigate(['/']);
  }
}