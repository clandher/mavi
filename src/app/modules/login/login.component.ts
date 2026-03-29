import { Component, inject } from '@angular/core';
import {
    ReactiveFormsModule,
    FormBuilder,
    FormGroup,
    FormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { FormGroupComponent } from "@app/components/form-group/form-group.component";
import { MaviValidators } from '@app/core/mavi-validators';
import { BtnLoadingComponent } from '@app/components/btn-loading/btn-loading.component';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule, FormGroupComponent, BtnLoadingComponent],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    loginForm: FormGroup;
    errorMessage: string | null = null;
    showPassword = false;

    constructor() {
        this.loginForm = this.fb.group({
            email: ['tsubasa@nankatsu.jp', [MaviValidators.required()]],
            password: ['SoraWoKakeru11', [MaviValidators.required(), MaviValidators.minLength(6)]]
        });
    }

    async onSubmit(): Promise<void> {
        if (this.loginForm.invalid) {
            this.markFormAsTouched();
            return;
        }

        this.errorMessage = null;
        const { email, password } = this.loginForm.value;
        try {
            await this.authService.login({ email, password }).toPromise();
            this.router.navigate(['/app']);
        } catch (err: any) {
            this.errorMessage = err.error?.message || 'Error al iniciar sesión. Por favor, verifica tus credenciales.';
        }
    }

    private markFormAsTouched(): void {
        Object.values(this.loginForm.controls).forEach(control => {
            control.markAsTouched();
        });
    }
}