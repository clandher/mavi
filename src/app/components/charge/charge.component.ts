import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { CreateChargeDto } from '@app/core/dto';
import { NgxMaskDirective } from 'ngx-mask';
import { SubmitComponent } from '../submit/submit.component';
import { FormGroupComponent } from '../form-group/form-group.component';
import { MaviValidators } from '@app/core/mavi-validators';
import { AfterViewInit } from '@angular/core';
import { setFocus } from '@app/core/helpers';

@Component({
    selector: 'app-charge',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxMaskDirective, SubmitComponent, FormGroupComponent],
    templateUrl: './charge.component.html',
    styleUrls: ['./charge.component.scss']
})

export class ChargeComponent implements AfterViewInit {
    @Input() studentActivityId: number | null = null;
    @Output() complete = new EventEmitter<boolean>();
    public formGroup: FormGroup;

    constructor(private http: HttpClient, private fb: FormBuilder) {
        this.formGroup = this.fb.group({
            amountToBePaid: ['', [MaviValidators.required(), MaviValidators.min(0.01)]],
            concept: ['', MaviValidators.required()],
            studentActivityId: ['', MaviValidators.required()],
        });
    }

    ngAfterViewInit() {
        setFocus('amountToBePaid');
    }

    ngOnChanges() {
        if (this.studentActivityId) {
            this.formGroup.patchValue({ studentActivityId: this.studentActivityId });
        }
    }

    closeModal(): void {
        this.complete.emit(false);
    }

    saveCharge(): Promise<void> {
        const chargeAPI = new BaseHttp('chargers', this.http);
        return chargeAPI.post<CreateChargeDto, any>(this.formGroup.value).toPromise()
            .then(() => {
                this.complete.emit(true);
            })
            .catch((err) => {
                console.error('Error al crear el cobro:', err);
                throw err;
            });
    }
}
