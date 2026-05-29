import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../shared/services/auth.service';
import { ToastService } from '../shared/services/toast.service';
import { LoadingService } from '../shared/services/loading.service';
import { CustomValidators } from '../shared/validators/custom-validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private auth  = inject(AuthService);
  private toast = inject(ToastService);
  private fb    = inject(FormBuilder);
  private loadingService = inject(LoadingService);

  tab      = 'login';
  error    = '';
  showPass = false;
  loginError = '';
  registerError = '';
  
  get isLoading() { return this.loadingService.isLoading(); }

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), CustomValidators.alphabetsOnly()]],
    email: ['', [Validators.required, Validators.email]],
    countryCode: ['+91', Validators.required],
    phone: ['', [Validators.required, CustomValidators.phoneNumber()]],
    password: ['', [Validators.required, CustomValidators.strongPassword()]],
    confirmPassword: ['', Validators.required]
  });
 
  onLogin() {
    this.loginError = '';
    if (this.loginForm.invalid) {
      this.loginError = 'Please enter a valid email and password.';
      return;
    }
    const { email, password } = this.loginForm.value;
    this.auth.login({ email: email || '', password: password || '' }).subscribe({
      next: res => {
        if (res.success) {
          // Check if user is active
          if (res.data.status && res.data.status !== 'ACTIVE') {
            this.loginError = 'Your account is inactive. Please report to facility.';
            return;
          }
          this.toast.success(`Welcome back, ${res.data.name}`);
          this.auth.redirectByRole();
        } else {
          this.loginError = res.message || 'Login failed.';
        }
      },
      error: err => {
        this.loginError = err?.error?.message || 'Invalid email or password.';
      }
    });
  }

  onRegister() {
    this.registerError = '';
    if (this.registerForm.invalid) {
      this.registerError = this.getValidationError();
      return;
    }
    const { name, email, countryCode, phone, password, confirmPassword } = this.registerForm.value;
    if (password !== confirmPassword) {
      this.registerError = 'Passwords do not match.';
      return;
    }
    // Clean phone number and ensure it's valid
    const cleanPhone = phone?.toString().replace(/\D/g, '') || '';
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      this.registerError = 'Phone number must be exactly 10 digits starting with 6-9.';
      return;
    }
    const fullPhone = `${countryCode}${cleanPhone}`;
    this.auth.register({ name: name || '', email: email || '', password: password || '', phone: fullPhone }).subscribe({
      next: res => {
        if (res.success) {
          this.toast.success('Account created! Please sign in.');
          this.tab = 'login';
          this.loginForm.patchValue({ email: email || '' });
          this.registerForm.reset({ name: '', email: '', countryCode: '+91', phone: '', password: '', confirmPassword: '' });
        } else {
          this.registerError = res.message || 'Registration failed.';
        }
      },
      error: err => {
        this.registerError = err?.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  getValidationError(): string {
    const form = this.registerForm;
    if (form.get('name')?.errors?.['required']) return 'Name is required.';
    if (form.get('name')?.errors?.['minlength']) return 'Name must be at least 2 characters.';
    if (form.get('name')?.errors?.['invalidName']) return 'Name can only contain alphabets and spaces.';
    if (form.get('email')?.errors?.['required']) return 'Email is required.';
    if (form.get('email')?.errors?.['email']) return 'Please enter a valid email.';
    if (form.get('phone')?.errors?.['required']) return 'Phone number is required.';
    if (form.get('phone')?.errors?.['invalidPhone']) return 'Phone must be exactly 10 digits starting with 6-9.';
    if (form.get('password')?.errors?.['required']) return 'Password is required.';
    if (form.get('password')?.errors?.['weakPassword']) return 'Password must be 8+ characters with 1 uppercase and 1 special character.';
    if (form.get('confirmPassword')?.errors?.['required']) return 'Please confirm your password.';
    return 'Please fill in all required fields correctly.';
  }
}
