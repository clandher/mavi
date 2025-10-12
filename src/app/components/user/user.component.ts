import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { FormGroupComponent } from "../form-group/form-group.component";
import { SubmitComponent } from '../submit/submit.component';
import { setFocus } from '@app/core/helpers';
import { MaviValidators } from '@app/core/mavi-validators';
import { ModalInjectable, ModalService } from '@app/core/modal.service';

@Component({
    selector: 'app-user',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormGroupComponent],
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserComponent implements ModalInjectable {
    @Input() userId: number = 0;
    @Output() complete = new EventEmitter<boolean>();

    disabled: boolean = false;
    public form: FormGroup;
    showPassword = false;

    constructor(
        private http: HttpClient,
        private fb: FormBuilder,
    ) {
        this.form = this.fb.group({
            name: ['', [MaviValidators.required()]],
            email: ['', [MaviValidators.required(), MaviValidators.email()]],
            password: ['', []],
            developer: [false, []],
            lock: [false, []]
        });
    }

    ngAfterViewInit(): void {
        this.loadUser(this.userId);
    }

    loadUser(id: number) {
        if (this.userId > 0) {
            const userAPI = new BaseHttp(`users/${id}`, this.http);
            userAPI.get<any>().subscribe(result => {
                this.form.patchValue({
                    name: result.name,
                    email: result.email,
                    developer: result.developer,
                    lock: result.lock,
                });

                this.form.get('password')?.clearValidators();
                this.form.get('password')?.updateValueAndValidity();

                if (result.lock) {
                    this.form.get('developer')?.disable();
                }

                setFocus('name');
            });
        } else {
            this.form.get('password')?.setValidators([MaviValidators.minLength(8), MaviValidators.required()]);
            this.form.get('password')?.updateValueAndValidity();
            setFocus('name');
        }
    }

    onSubmit(): Promise<void> {
        return new Promise((resolve, reject) => {
            const formValue = this.form.value;
            const usersAPI = new BaseHttp(`users`, this.http);

            if (this.userId !== 0) {
                usersAPI.patch<any, any>(this.userId, {
                    name: formValue.name,
                    email: formValue.email,
                    developer: formValue.developer,
                }).subscribe({
                    next: () => { this.complete.emit(true); resolve(); },
                    error: (err) => { console.error('Error updating user:', err); reject(err); }
                });
            } else {
                usersAPI.post<any, any>({
                    name: formValue.name,
                    email: formValue.email,
                    password: formValue.password,
                    developer: formValue.developer,
                }).subscribe({
                    next: () => { this.complete.emit(true); resolve(); },
                    error: (err) => { console.error('Error creating user:', err); reject(err); }
                });
            }
        });
    }
}