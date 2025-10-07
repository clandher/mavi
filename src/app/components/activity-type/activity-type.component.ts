import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { FormGroupComponent } from "../form-group/form-group.component";
import { SubmitComponent } from '../submit/submit.component';
import { setFocus } from '@app/core/helpers';
import { MaviValidators } from '@app/core/mavi-validators';

@Component({
    selector: 'app-activity-type',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormGroupComponent, SubmitComponent],
    templateUrl: './activity-type.component.html',
    styleUrls: ['./activity-type.component.scss']
})
export class ActivityTypeComponent {
    @Input() activityTypeId: number = 0;
    @Output() complete = new EventEmitter<boolean>();

    public activityTypeForm: FormGroup;

    constructor(
        private http: HttpClient,
        private fb: FormBuilder,
    ) {
        this.activityTypeForm = this.fb.group({
            key: [null, []],
            recurrent: [false, []],
            rule: [null, []],
            format: [null, []],
        });

        this.activityTypeForm.get('recurrent')?.valueChanges.subscribe((recurrent: boolean) => {
            const ruleControl = this.activityTypeForm.get('rule');
            if (recurrent) {
                ruleControl?.setValidators([MaviValidators.required()]);
            } else {
                ruleControl?.clearValidators();
            }
            ruleControl?.updateValueAndValidity();
        });
    }

    ngAfterViewInit(): void {
        this.loadActivityType(this.activityTypeId);
    }

    loadActivityType(id: number) {
        if (this.activityTypeId > 0) {
            const activityTypeAPI = new BaseHttp(`activity-types/${id}`, this.http);
            activityTypeAPI.get<any>().subscribe(result => {
                this.activityTypeForm.patchValue({
                    key: result.key,
                    recurrent: result.recurrent,
                    rule: result.rule,
                    format: result.format,
                });

                setFocus('key');
            });
        } else {
            setFocus('key');
        }
    }

    saveActivityType(): Promise<void> {
        return new Promise((resolve, reject) => {
            const formValue = this.activityTypeForm.value;
            const activityTypesAPI = new BaseHttp(`activity-types`, this.http);

            if (this.activityTypeId !== 0) {
                activityTypesAPI.patch<any, any>(this.activityTypeId, formValue).subscribe({
                    next: () => { this.complete.emit(true); resolve(); },
                    error: (err) => { console.error('Error updating activity type:', err); reject(err); }
                });
            } else {
                activityTypesAPI.post<any, any>(formValue).subscribe({
                    next: () => { this.complete.emit(true); resolve(); },
                    error: (err) => { console.error('Error creating activity type:', err); reject(err); }
                });
            }
        });
    }

    closeModal(): void {
        this.complete.emit(false);
    }
}