import { Component, inject } from '@angular/core';
import {
    ReactiveFormsModule,
    FormBuilder,
    FormGroup,
    Validators,
    FormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    loginForm: FormGroup;
    errorMessage: string | null = null;
    loading = false;
    showPassword = false;

    constructor() {
        this.loginForm = this.fb.group({
            email: ['otsubasa', [Validators.required]],
            password: ['123456', [Validators.required, Validators.minLength(6)]]
        });
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            this.markFormAsTouched();
            return;
        }

        this.loading = true;
        this.errorMessage = null;

        const { email, password } = this.loginForm.value;

        this.authService.login({ email, password }).subscribe({
            next: () => {
                this.router.navigate(['/app']);
            },
            error: (err) => {
                this.errorMessage = err.error?.message || 'Error al iniciar sesión. Por favor, verifica tus credenciales.';
                this.loading = false;
            },
            complete: () => {
                this.loading = false;
            }
        });
    }

    private markFormAsTouched(): void {
        Object.values(this.loginForm.controls).forEach(control => {
            control.markAsTouched();
        });
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }
}