

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { FormGroupComponent } from '../form-group/form-group.component';
import { setFocus } from '@app/core/helpers';
import { ModalInjectable } from '@app/core/modal.service';

@Component({
    selector: 'app-gate-control-user',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormGroupComponent],
    templateUrl: './gate-control-user.component.html',
    styleUrls: ['./gate-control-user.component.scss']
})
export class GateControlUserComponent implements ModalInjectable {
    disabled: boolean = false;

    @Input() userId: string = '';
    @Output() complete = new EventEmitter<boolean>();

    public form: FormGroup;

    constructor(
        private http: HttpClient,
        private fb: FormBuilder,
    ) {
        this.form = this.fb.group({
            name: ['', []],
            phone: ['', []],
            active: [true, []]
        });
    }

    ngAfterViewInit(): void {
        this.loadUser(this.userId);
    }

    loadUser(id: string) {
        if (id && id !== '0') {
            const userAPI = new BaseHttp(`gate-control-users/${id}`, this.http);
            userAPI.get<any>().subscribe(result => {
                this.form.patchValue({
                    name: result.name,
                    phone: result.phone,
                    active: result.active
                });
                setFocus('name');
            });
        } else {
            setTimeout(() => {
                setFocus('name');
            }, 100);
        }
    }

    onSubmit(): Promise<void> {
        return new Promise((resolve, reject) => {
            const formValue = this.form.value;
            const usersAPI = new BaseHttp(`gate-control-users`, this.http);

            if (this.userId && this.userId !== '0') {
                usersAPI.patch<any, any>(this.userId, formValue).subscribe({
                    next: () => { this.complete.emit(true); resolve(); },
                    error: (err) => { console.error('Error updating user:', err); reject(err); }
                });
            } else {
                usersAPI.post<any, any>(formValue).subscribe({
                    next: () => { this.complete.emit(true); resolve(); },
                    error: (err) => { console.error('Error creating user:', err); reject(err); }
                });
            }
        });
    }
}
