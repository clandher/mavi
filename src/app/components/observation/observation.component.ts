import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { FormGroupComponent } from "../form-group/form-group.component";
import { setFocus } from '@app/core/helpers';
import { ModalInjectable } from '@app/core/modal.service';

@Component({
    selector: 'app-observation',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormGroupComponent],
    templateUrl: './observation.component.html',
})
export class ObservationComponent implements ModalInjectable {
    disabled: boolean = false;

    @Input() observationId: number = 0;
    @Output() complete = new EventEmitter<boolean>();

    public form: FormGroup;

    constructor(
        private http: HttpClient,
        private fb: FormBuilder,
    ) {
        this.form = this.fb.group({
            description: ['', []]
        });
    }

    ngAfterViewInit(): void {
        this.fetch(this.observationId);
    }

    fetch(id: number) {
        if (this.observationId > 0) {
            const observationAPI = new BaseHttp(`observations/${id}`, this.http);
            observationAPI.get<{ description: string }>().subscribe(result => {
                this.form.patchValue({
                    description: result.description
                });

                setFocus('description');
            });
        } else {
            setTimeout(() => {
                setFocus('description');
            }, 100);
        }
    }

    onSubmit(): Promise<void> {
        return new Promise((resolve, reject) => {
            const formValue = this.form.value;
            const observationsAPI = new BaseHttp(`observations`, this.http);

            if (this.observationId !== 0) {
                observationsAPI.patch<{ description: string }, { description: string }>(this.observationId, formValue).subscribe({
                    next: () => { this.complete.emit(true); resolve(); },
                    error: (err) => { console.error('Error updating observation:', err); reject(err); }
                });
            } else {
                observationsAPI.post<{ description: string }, { description: string }>(formValue).subscribe({
                    next: () => { this.complete.emit(true); resolve(); },
                    error: (err) => { console.error('Error creating observation:', err); reject(err); }
                });
            }
        });
    }
}
