import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly errorMessage = signal('');
  readonly infoMessage = signal('');
  readonly passwordVisible = signal(false);
  readonly form = new FormGroup({
    userId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] })
  });

  submit(): void {
    this.errorMessage.set('');
    this.infoMessage.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { userId, password } = this.form.getRawValue();
    if (!this.authService.startDemoSession(userId, password)) {
      this.errorMessage.set('Unable to start a session in this browser.');
      return;
    }

    void this.router.navigateByUrl('/trading');
  }

  togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  showRecoveryInfo(): void {
    this.infoMessage.set('Account recovery is not available in this demo.');
  }

  showSignupInfo(): void {
    this.infoMessage.set('Account signup is not available in this demo.');
  }
}