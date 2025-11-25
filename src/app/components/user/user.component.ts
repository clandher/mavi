import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { FormGroupComponent } from "../form-group/form-group.component";
import { setFocus } from '@app/core/helpers';
import { MaviValidators } from '@app/core/mavi-validators';
import { ModalInjectable } from '@app/core/modal.service';

@Component({
    selector: 'app-user',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormGroupComponent],
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserComponent implements ModalInjectable {
    getChecked(event: Event): boolean {
        return (event.target instanceof HTMLInputElement) ? event.target.checked : false;
    }

    @Input() userId: number = 0;
    @Output() complete = new EventEmitter<boolean>();

    disabled: boolean = false;
    public form: FormGroup;
    showPassword = false;
    rolesList = [
        { key: 'STUDENT', label: 'Estudiante' },
        { key: 'TUTOR', label: 'Tutor' },
        { key: 'EMPLOYEE', label: 'Empleado' }
    ];
    students: any[] = [];
    tutors: any[] = [];
    employees: any[] = [];

    constructor(
        private http: HttpClient,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef,
    ) {
        this.form = this.fb.group({
            name: ['', [MaviValidators.required()]],
            email: ['', [MaviValidators.required(), MaviValidators.email()]],
            password: ['', []],
            developer: [false, []],
            lock: [false, []],
            roles: [[], [MaviValidators.required()]],
            studentId: [null],
            tutorId: [null],
            employeeId: [null]
        });
        this.loadLists();
    }

    loadLists() {
        // Cargar estudiantes
        new BaseHttp('students', this.http).get<any[]>().subscribe(data => {
            this.students = data;
        });
        // Cargar tutores
        new BaseHttp('tutors', this.http).get<any[]>().subscribe(data => {
            this.tutors = data;
        });
        // Cargar empleados
        new BaseHttp('employees', this.http).get<any[]>().subscribe(data => {
            this.employees = data;
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
                    roles: result.roles || [],
                    studentId: result.studentId || null,
                    tutorId: result.tutorId || null,
                    employeeId: result.employeeId || null
                });

                // Habilitar/deshabilitar selects según los roles cargados
                if (result.roles?.includes('STUDENT')) {
                    this.form.get('studentId')?.enable();
                } else {
                    this.form.get('studentId')?.disable();
                }
                if (result.roles?.includes('TUTOR')) {
                    this.form.get('tutorId')?.enable();
                } else {
                    this.form.get('tutorId')?.disable();
                }
                if (result.roles?.includes('EMPLOYEE')) {
                    this.form.get('employeeId')?.enable();
                } else {
                    this.form.get('employeeId')?.disable();
                }

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
            // Deshabilitar selects al crear usuario nuevo
            this.form.get('studentId')?.disable();
            this.form.get('tutorId')?.disable();
            this.form.get('employeeId')?.disable();
            setFocus('name');
        }
    }

    onSubmit(): Promise<void> {
        return new Promise((resolve, reject) => {
            const formValue = this.form.value;
            const usersAPI = new BaseHttp(`users`, this.http);
            const payload: any = {
                name: formValue.name,
                email: formValue.email,
                developer: formValue.developer,
                roles: formValue.roles,
                studentId: formValue.roles.includes('STUDENT') ? formValue.studentId : null,
                tutorId: formValue.roles.includes('TUTOR') ? formValue.tutorId : null,
                employeeId: formValue.roles.includes('EMPLOYEE') ? formValue.employeeId : null
            };
            if (this.userId !== 0) {
                usersAPI.patch<any, any>(this.userId, payload).subscribe({
                    next: () => { this.complete.emit(true); resolve(); },
                    error: (err) => { console.error('Error updating user:', err); reject(err); }
                });
            } else {
                usersAPI.post<any, any>({
                    ...payload,
                    password: formValue.password,
                }).subscribe({
                    next: () => { this.complete.emit(true); resolve(); },
                    error: (err) => { console.error('Error creating user:', err); reject(err); }
                });
            }
        });
    }

    onRoleToggle(roleKey: string, checked: boolean) {
        let currentRoles = this.form.get('roles')?.value || [];
        let newRoles: string[];
        if (checked) {
            newRoles = [...currentRoles, roleKey].filter((v, i, arr) => arr.indexOf(v) === i);
        } else {
            newRoles = currentRoles.filter((r: string) => r !== roleKey);
        }
        this.form.get('roles')?.setValue(newRoles);
        this.form.get('roles')?.markAsDirty();
        this.form.get('roles')?.updateValueAndValidity();

        // Habilitar/deshabilitar los selects según el estado del checkbox
        if (roleKey === 'STUDENT') {
            if (checked) {
                this.form.get('studentId')?.enable();
            } else {
                this.form.get('studentId')?.setValue(null);
                this.form.get('studentId')?.disable();
            }
        }
        if (roleKey === 'TUTOR') {
            if (checked) {
                this.form.get('tutorId')?.enable();
            } else {
                this.form.get('tutorId')?.setValue(null);
                this.form.get('tutorId')?.disable();
            }
        }
        if (roleKey === 'EMPLOYEE') {
            if (checked) {
                this.form.get('employeeId')?.enable();
            } else {
                this.form.get('employeeId')?.setValue(null);
                this.form.get('employeeId')?.disable();
            }
        }
        this.cdr.detectChanges();
    }

    isRoleActive(roleKey: string): boolean {
        return this.form.get('roles')?.value?.includes(roleKey);
    }
}