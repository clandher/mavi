import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { FormGroupComponent } from "../form-group/form-group.component";
import { MaviValidators } from '@app/core/mavi-validators';
import { ModalInjectable } from '@app/core/modal.service';
import { DiscountType } from '@app/core/dto';
import { CurrencyMXPipe } from "../../core/currency-mx.pipe";

@Component({
    selector: 'app-discount',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormGroupComponent, CurrencyMXPipe],
    templateUrl: './discount.component.html',
    styleUrls: ['./discount.component.scss']
})
export class DiscountComponent implements ModalInjectable {

    @Input() chargeId: number = 0;
    @Input() amountRemaining: number = 0;
    @Output() complete = new EventEmitter<boolean>();

    disabled: boolean = false;

    public form: FormGroup;

    public discountTypes: DiscountType[] = [];

    getFinalAmount(): number {
        const discountTypeId = this.form.get('discountTypeId')?.value;
        const discountType = this.discountTypes.find(dt => dt.id === discountTypeId);
        if (!discountType) return this.amountRemaining;
        if (discountType.type === 'percentage') {
            return this.amountRemaining - (this.amountRemaining * (discountType.value / 100));
        } else if (discountType.type === 'amount') {
            return Math.max(0, this.amountRemaining - discountType.value);
        }
        return this.amountRemaining;
    }

    getDiscountAmount(): string | number {
        const discountTypeId = this.form.get('discountTypeId')?.value;
        const discountType = this.discountTypes.find(dt => dt.id === discountTypeId);
        if (!discountType) return 0;
        if (discountType.type === 'percentage') {
            return this.amountRemaining * (discountType.value / 100);
        } else if (discountType.type === 'amount') {
            return Math.min(this.amountRemaining, discountType.value);
        }
        return 0;
    }

    constructor(
        private http: HttpClient,
        private fb: FormBuilder,
    ) {
        this.form = this.fb.group({
            reason: [null, [MaviValidators.required()]],
            chargeId: [null, [MaviValidators.required()]],
            discountTypeId: [null, [MaviValidators.required()]],
        });
    }

    ngOnInit(): void {
        this.form.patchValue({ chargeId: this.chargeId });
    }

    ngAfterViewInit(): void {
        this.loadDiscountTypes();
    }

    loadDiscountTypes() {
        const discountTypeAPI = new BaseHttp(`discount-types`, this.http);
        discountTypeAPI.get<any>().subscribe(result => {
            this.discountTypes = result;
            if (this.discountTypes.length > 0) {
                this.form.patchValue({
                    reason: 'Descuento aplicado',
                    discountTypeId: this.discountTypes[0].id
                });

                this.form.markAsDirty();
            }
        });
    }

    onSubmit(): Promise<void> {
        return new Promise((resolve, reject) => {
            const formValue = this.form.value;
            const discountsAPI = new BaseHttp('discounts', this.http);
            discountsAPI.post<any, any>(formValue).subscribe({
                next: () => {
                    this.complete.emit(true);
                    resolve();
                },
                error: (err) => {
                    console.error('Error creating discount:', err);
                    reject(err);
                }
            });
        });
    }
}