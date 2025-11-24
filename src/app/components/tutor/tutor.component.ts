import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { FormGroupComponent } from "../form-group/form-group.component";
import { setFocus } from '@app/core/helpers';
import { ModalInjectable } from '@app/core/modal.service';

@Component({
    selector: 'app-tutor',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormGroupComponent],
    templateUrl: './tutor.component.html',
    styleUrls: ['./tutor.component.scss']
})
export class TutorComponent implements ModalInjectable {
    disabled: boolean = false;

    @Input() tutorId: number = 0;
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
        this.loadTutor(this.tutorId);
    }

    loadTutor(id: number) {
        if (this.tutorId > 0) {
            const tutorAPI = new BaseHttp(`tutors/${id}`, this.http);
            tutorAPI.get<any>().subscribe(result => {
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
            const tutorsAPI = new BaseHttp(`tutors`, this.http);

            if (this.tutorId !== 0) {
                tutorsAPI.patch<any, any>(this.tutorId, formValue).subscribe({
                    next: () => { this.complete.emit(true); resolve(); },
                    error: (err) => { console.error('Error updating tutor:', err); reject(err); }
                });
            } else {
                tutorsAPI.post<any, any>(formValue).subscribe({
                    next: () => { this.complete.emit(true); resolve(); },
                    error: (err) => { console.error('Error creating tutor:', err); reject(err); }
                });
            }
        });
    }
}
