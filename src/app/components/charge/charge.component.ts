import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { CreateChargeDto } from '@app/core/dto';
import { NgxMaskDirective } from 'ngx-mask';
import { FormGroupComponent } from '../form-group/form-group.component';
import { MaviValidators } from '@app/core/mavi-validators';
import { AfterViewInit } from '@angular/core';
import { setFocus } from '@app/core/helpers';
import { ModalInjectable, ModalService } from '@app/core/modal.service';

@Component({
    selector: 'app-charge',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxMaskDirective, FormGroupComponent],
    templateUrl: './charge.component.html',
    styleUrls: ['./charge.component.scss']
})

export class ChargeComponent implements AfterViewInit, ModalInjectable {
    @Input() studentActivityId: number | null = null;
    @Input() studentId: number | null = null;
    @Input() activityId: number | null = null;

    @Output() complete = new EventEmitter<boolean>();

    disabled: boolean = false;
    public form: FormGroup;

    constructor(
        private http: HttpClient,
        private fb: FormBuilder,
    ) {
        this.form = this.fb.group({
            amountToBePaid: ['', [MaviValidators.required(), MaviValidators.min(0.01)]],
            concept: ['', MaviValidators.required()],
            studentActivityId: ['', MaviValidators.required()],
            studentId: ['', MaviValidators.required()],
            activityId: ['', MaviValidators.required()],
        });
    }

    ngAfterViewInit() {
        setFocus('amountToBePaid');
    }

    ngOnChanges() {
        if (this.studentActivityId) {
            this.form.patchValue({
                studentActivityId: this.studentActivityId,
                studentId: this.studentId,
                activityId: this.activityId
            });
        }
    }


    onSubmit(): Promise<void> {
        const chargeAPI = new BaseHttp('chargers', this.http);
        return chargeAPI.post<CreateChargeDto, any>(this.form.value).toPromise()
            .then(() => {
                this.complete.emit(true);
            })
            .catch((err) => {
                console.error('Error al crear el cobro:', err);
                throw err;
            });
    }
}
