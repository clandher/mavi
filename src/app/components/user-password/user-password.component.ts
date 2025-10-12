import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { setFocus } from '@app/core/helpers';
import { FormGroupComponent } from '../form-group/form-group.component';
import { ModalInjectable } from '@app/core/modal.service';

@Component({
    selector: 'app-user-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule,  FormGroupComponent],
    templateUrl: './user-password.component.html',
    styleUrls: ['./user-password.component.scss']
})
export class UserPasswordComponent implements ModalInjectable {
    @Input() userId: number = 0;
    @Output() complete = new EventEmitter<boolean>();

    disabled: boolean = false;

    public form: FormGroup;
    public showPassword: boolean = false;

    constructor(
        private http: HttpClient,
        private fb: FormBuilder,
    ) {
        this.form = this.fb.group({
            password: ['', [Validators.required, Validators.minLength(8)]]
        });
    }

    ngAfterViewInit(): void {
        setFocus('password');
    }

    async onSubmit(): Promise<void> {
        const passwordAPI = new BaseHttp(`users`, this.http);
        await passwordAPI.patch<any, any>(`${this.userId}/password`, {
            password: this.form.value.password
        }).toPromise();
        this.complete.emit(true);
    }
}