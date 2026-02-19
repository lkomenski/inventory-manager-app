import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './account.component.html'
})
export class AccountComponent {
  loginForm: FormGroup;
  isLoggedIn = signal(false);
  userEmail = signal('');
  loginDate = signal('');

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    // Check if already logged in
    const savedEmail = localStorage.getItem('userEmail');
    const savedDate = localStorage.getItem('loginDate');
    if (savedEmail) {
      this.isLoggedIn.set(true);
      this.userEmail.set(savedEmail);
      this.loginDate.set(savedDate || new Date().toLocaleDateString());
    }
  }

  isLoginFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    const email = this.loginForm.value.email;
    const date = new Date().toLocaleDateString();
    
    // Save to localStorage (simple demo)
    localStorage.setItem('userEmail', email);
    localStorage.setItem('loginDate', date);
    
    this.userEmail.set(email);
    this.loginDate.set(date);
    this.isLoggedIn.set(true);
    
    // Reset form
    this.loginForm.reset();
  }

  onLogout(): void {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('loginDate');
    this.isLoggedIn.set(false);
    this.userEmail.set('');
    this.loginDate.set('');
  }
}