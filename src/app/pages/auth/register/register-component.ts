import { Component, signal } from "@angular/core";
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-auth-register",
  templateUrl: "./register.html"
})
export class RegisterComponent {
    form: FormGroup;

    private auth = inject(AuthService);

    serverError = signal<string | null>(null);
    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            passwordConfirmation: ['', [Validators.required, Validators.minLength(6), this.passwordMatchValidator()]],
        });
    }

    passwordMatchValidator(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors | null> => {
            const password = this.form?.get('password')?.value;
            const passwordConfirmation = this.form?.get('passwordConfirmation')?.value;
            if (password && passwordConfirmation && password !== passwordConfirmation) {
                return new Observable(observer => {
                    observer.next({ passwordMismatch: true });
                    observer.complete();
                });
            }
            return new Observable(observer => {
                observer.next(null);
                observer.complete();
            });
        };
    }
onSubmit(){
    if (this.form.invalid) {
        this.form.markAllAsTouched();
        console.log("Form is invalid", this.form.errors || 'see control errors');
        return;
    }

    this.serverError.set(null);

    try {
        this.authService.register(this.form?.get('email')?.value, this.form?.get('password')?.value).subscribe({
        // redirect to dashboard
        });
    } catch (err) {
        console.error("Registration error", err);
        this.serverError.set('An unexpected error occurred. Please try again later.');
    }
    }
}