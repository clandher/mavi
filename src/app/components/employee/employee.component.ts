import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { FormGroupComponent } from "../form-group/form-group.component";
import { setFocus } from '@app/core/helpers';
import { ModalInjectable } from '@app/core/modal.service';

@Component({
    selector: 'app-employee',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormGroupComponent],
    templateUrl: './employee.component.html',
    styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements ModalInjectable {
    disabled: boolean = false;

    @Input() employeeId: number = 0;
    @Output() complete = new EventEmitter<boolean>();

    public form: FormGroup;

    constructor(
        private http: HttpClient,
        private fb: FormBuilder,
    ) {
        this.form = this.fb.group({
            name: ['', []]
        });
    }

    ngAfterViewInit(): void {
        this.loadEmployee(this.employeeId);
    }

    loadEmployee(id: number) {
        if (this.employeeId > 0) {
            const employeeAPI = new BaseHttp(`employees/${id}`, this.http);
            employeeAPI.get<any>().subscribe(result => {
                this.form.patchValue({
                    name: result.name
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
            const employeesAPI = new BaseHttp(`employees`, this.http);

            if (this.employeeId !== 0) {
                employeesAPI.patch<any, any>(this.employeeId, formValue).subscribe({
                    next: () => { this.complete.emit(true); resolve(); },
                    error: (err) => { console.error('Error updating employee:', err); reject(err); }
                });
            } else {
                employeesAPI.post<any, any>(formValue).subscribe({
                    next: () => { this.complete.emit(true); resolve(); },
                    error: (err) => { console.error('Error creating employee:', err); reject(err); }
                });
            }
        });
    }
}
