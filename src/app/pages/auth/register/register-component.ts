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

  registerFields = REGISTER_FIELDS;
  formConfig: FormConfig = { mode: 'create' };
  submitting = signal(false);
  serverError = signal<string | null>(null);

  onFormSubmit(formData: FormSubmitData): void {
    this.serverError.set(null);
    this.submitting.set(true);

    try {
      this.authService.register(
        formData['email'] as string,
        formData['password'] as string
      );
      
      this.submitting.set(false);
      // Redirect to account/dashboard after successful registration
      this.router.navigate(['/account']);
    } catch (err) {
      this.submitting.set(false);
      console.error("Registration error", err);
      
      if (err instanceof Error) {
        this.serverError.set(err.message);
      } else {
        this.serverError.set('An unexpected error occurred. Please try again later.');
      }
    }
  }

  onFormCancel(): void {
    // Handle cancel - navigate to login or home
    this.router.navigate(['/auth/login']);
  }
}