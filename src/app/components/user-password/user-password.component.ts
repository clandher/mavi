import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { SubmitComponent } from '../submit/submit.component';
import { setFocus } from '@app/core/helpers';
import { FormGroupComponent } from '../form-group/form-group.component';

@Component({
    selector: 'app-user-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, SubmitComponent, FormGroupComponent],
    templateUrl: './user-password.component.html',
    styleUrls: ['./user-password.component.scss']
})
export class UserPasswordComponent {
    @Input() userId: number = 0;
    @Output() complete = new EventEmitter<boolean>();

    public passwordForm: FormGroup;
    public showPassword: boolean = false;

    constructor(
        private http: HttpClient,
        private fb: FormBuilder,
    ) {
        this.passwordForm = this.fb.group({
            password: ['', [Validators.required, Validators.minLength(8)]]
        });
    }

    ngAfterViewInit(): void {
        setFocus('password');
    }

    async savePassword(): Promise<void> {
        const passwordAPI = new BaseHttp(`users`, this.http);
        await passwordAPI.patch<any, any>(`${this.userId}/password`, {
            password: this.passwordForm.value.password
        }).toPromise();
        this.complete.emit(true);
    }

    closeModal(): void {
        this.complete.emit(false);
    }
}