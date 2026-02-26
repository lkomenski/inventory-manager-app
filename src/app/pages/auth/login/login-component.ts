import { Component, signal } from "@angular/core";
import {FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-auth-login",
  templateUrl: "./login.html"
})
export class LoginComponent {  
    // same as register but with only email and password fields, and a login method instead of register
    form: FormGroup;

    private auth = inject(AuthService);

    serverError = signal<string | null>(null);
    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
    }
    onSubmit(){
    if (this.form.invalid) {
        this.form.markAllAsTouched();
        console.log("Form is invalid", this.form.errors || 'see control errors');
        return;
    }

    this.serverError.set(null);

    try {
        this.authService.login(this.form?.get('email')?.value, this.form?.get('password')?.value).subscribe({
        // redirect to dashboard
        });
    } catch (err) {
        console.error("Login error", err);
        this.serverError.set('An unexpected error occurred. Please try again later.');
    }
    }
 }