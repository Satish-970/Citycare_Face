import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static phoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value.trim() === '') return null; // Allow empty
      const phoneRegex = /^[6-9]\d{9}$/;
      const cleanValue = control.value.replace(/\D/g, ''); // Remove non-digits
      return phoneRegex.test(cleanValue) ? null : { invalidPhone: true };
    };
  }

  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const hasUpperCase = /[A-Z]/.test(control.value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(control.value);
      const hasMinLength = control.value.length >= 8;
      
      if (!hasUpperCase || !hasSpecialChar || !hasMinLength) {
        return { weakPassword: true };
      }
      return null;
    };
  }

  static alphabetsOnly(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const alphabetRegex = /^[a-zA-Z\s]+$/;
      return alphabetRegex.test(control.value) ? null : { invalidName: true };
    };
  }
}