import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { FormGroupComponent } from "../form-group/form-group.component";
import { setFocus } from '@app/core/helpers';
import { MaviValidators } from '@app/core/mavi-validators';
import { ModalInjectable } from '@app/core/modal.service';

@Component({
    selector: 'app-discount-type',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormGroupComponent],
    templateUrl: './discount-type.component.html',
    styleUrls: ['./discount-type.component.scss']
})
export class DiscountTypeComponent implements ModalInjectable {
    @Input() discountTypeId: number = 0;
    @Output() complete = new EventEmitter<boolean>();

    disabled: boolean = false;

    public form: FormGroup;

    constructor(
        private http: HttpClient,
        private fb: FormBuilder,
    ) {
        this.form = this.fb.group({
            key: [null, [MaviValidators.required()]],
            type: ['percentage', [MaviValidators.required()]],
            value: [null, [MaviValidators.required(), MaviValidators.min(0.01)]],
        });
    }

    ngAfterViewInit(): void {
        this.loadDiscountType(this.discountTypeId);
    }

    loadDiscountType(id: number) {
        if (this.discountTypeId > 0) {
            const discountTypeAPI = new BaseHttp(`discount-types/${id}`, this.http);
            discountTypeAPI.get<any>().subscribe(result => {
                this.form.patchValue({
                    key: result.key,
                    type: result.type,
                    value: result.value,
                });
                setFocus('key');
            });


            this.form.get('type')?.disable();
            this.form.get('value')?.disable();

        } else {
            setFocus('key');
        }
    }

    onSubmit(): Promise<void> {
        return new Promise((resolve, reject) => {
            const formValue = this.form.value;
            const discountTypesAPI = new BaseHttp(`discount-types`, this.http);
            if (this.discountTypeId !== 0) {
                discountTypesAPI.patch<any, any>(this.discountTypeId, formValue).subscribe({
                    next: () => { this.complete.emit(true); resolve(); },
                    error: (err) => { console.error('Error updating discount type:', err); reject(err); }
                });
            } else {
                discountTypesAPI.post<any, any>(formValue).subscribe({
                    next: () => { this.complete.emit(true); resolve(); },
                    error: (err) => { console.error('Error creating discount type:', err); reject(err); }
                });
            }
        });
    }
}