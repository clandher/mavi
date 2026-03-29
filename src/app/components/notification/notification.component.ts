import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { FormGroupComponent } from "../form-group/form-group.component";
import { setFocus } from '@app/core/helpers';
import { ModalInjectable } from '@app/core/modal.service';
import { MaviValidators } from '@app/core/mavi-validators';

@Component({
    selector: 'app-notification',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormGroupComponent],
    templateUrl: './notification.component.html',
})
export class NotificationComponent implements ModalInjectable {
    disabled: boolean = false;

    @Input() notificationId: number = 0;
    @Output() complete = new EventEmitter<boolean>();

    public form: FormGroup;

    categories: Array<{ id: number; type: string }> = [];
    activities: Array<{ id: number; description: string }> = [];
    students: Array<{ id: number; name: string }> = [];

    constructor(
        private http: HttpClient,
        private fb: FormBuilder,
    ) {
        this.form = this.fb.group({
            type: [1, []],
            categoryId: [null, []],
            activityId: [null, []],
            studentId: [null, []],
            message: ['Hola!', [MaviValidators.required()]]
        });

        this.form.markAsDirty();

        this.form.get('type')?.valueChanges.subscribe((type) => {
            this.onTypeChange(type);
        });
    }

    ngAfterViewInit(): void {
        this.fetch(this.notificationId);
    }

    fetch(id: number) {
        if (this.notificationId > 0) {
            const notificationAPI = new BaseHttp(`notifications/${id}`, this.http);
            notificationAPI.get<{ type: number; categoryId?: number; activityId?: number; studentId?: number; message: string }>().subscribe(result => {
                this.form.patchValue({
                    type: result.type,
                    categoryId: result.categoryId,
                    activityId: result.activityId,
                    studentId: result.studentId,
                    message: result.message
                });
                setFocus('message');
                this.onTypeChange(result.type);
            });
        } else {
            setTimeout(() => {
                setFocus('message');
            }, 100);
            this.onTypeChange(this.form.get('type')?.value);
        }
    }

    onTypeChange(type: number) {
        this.categories = [];
        this.activities = [];
        this.students = [];

        this.form.get('categoryId')?.clearValidators();
        this.form.get('activityId')?.clearValidators();
        this.form.get('studentId')?.clearValidators();

        if (type === 2) {
            this.form.get('categoryId')?.setValidators([MaviValidators.required()]);
            this.form.get('categoryId')?.updateValueAndValidity();
            const categoriesAPI = new BaseHttp('categories', this.http);
            categoriesAPI.get<Array<{ id: number; type: string }>>().subscribe(data => {
                this.categories = data;
            });
        } else if (type === 3) {
            this.form.get('activityId')?.setValidators([MaviValidators.required()]);
            this.form.get('activityId')?.updateValueAndValidity();
            const activitiesAPI = new BaseHttp('activities', this.http);
            activitiesAPI.get<Array<{ id: number; description: string }>>().subscribe(data => {
                this.activities = data;
            });
        } else if (type === 4) {
            this.form.get('studentId')?.setValidators([MaviValidators.required()]);
            this.form.get('studentId')?.updateValueAndValidity();
            const studentsAPI = new BaseHttp('students', this.http);
            studentsAPI.get<Array<{ id: number; name: string }>>().subscribe(data => {
                this.students = data;
            });
        } else {
            this.form.get('categoryId')?.updateValueAndValidity();
            this.form.get('activityId')?.updateValueAndValidity();
            this.form.get('studentId')?.updateValueAndValidity();
        }
    }

    onSubmit(): Promise<void> {
        return new Promise((resolve, reject) => {
            const formValue = this.form.value;
            const notificationsAPI = new BaseHttp(`notifications`, this.http);

            if (this.notificationId !== 0) {
                notificationsAPI.patch(formValue, this.notificationId).subscribe({
                    next: () => { this.complete.emit(true); resolve(); },
                    error: (err) => { console.error('Error updating notification:', err); reject(err); }
                });
            } else {
                notificationsAPI.post(formValue).subscribe({
                    next: () => { this.complete.emit(true); resolve(); },
                    error: (err) => { console.error('Error creating notification:', err); reject(err); }
                });
            }
        });
    }
}
