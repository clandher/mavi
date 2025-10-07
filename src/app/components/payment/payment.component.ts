import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { LocalStorage } from '../../core/local-storage';
import { HttpClient } from '@angular/common/http';
import { Charge, CreatePaymentDto, StudentPayment } from '@app/core/dto';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { BaseHttp } from '@app/core/base-http';
import { RequestQueryBuilder } from '@dataui/crud-request';
import { VoucherHelper } from '@app/core/voucher.helper';
import { CurrencyMXPipe } from "../../core/currency-mx.pipe";
import { SchoolService } from '@app/core/school.service';
import { SubmitComponent } from '../submit/submit.component';
import { firstValueFrom } from 'rxjs';
import { NgxMaskDirective } from 'ngx-mask';
import { setFocus } from '@app/core/helpers';

@Component({
    selector: 'app-payment',
    templateUrl: './payment.component.html',
    styleUrls: ['./payment.component.scss'],
    imports: [CommonModule, FormsModule, ReactiveFormsModule, CurrencyMXPipe, SubmitComponent, NgxMaskDirective],
    standalone: true
})
export class PaymentComponent implements OnChanges {
    @Input() studentId!: number;
    @Output() complete = new EventEmitter<boolean>();

    public charges: Charge[] = [];
    public downloadVoucher = new LocalStorage<boolean>('download.voucher', true);
    public formGroup: FormGroup;

    private _paymentDistribution: number[] = [];

    constructor(
        private http: HttpClient,
        private schoolService: SchoolService
    ) {
        this.formGroup = new FormGroup({
            paymentAmount: new FormControl('', [Validators.required, Validators.min(0)])
        });

        this.formGroup.get('paymentAmount')?.valueChanges.subscribe(() => {
            this.updatePaymentDistribution();
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        this._loadCharges();
        this.formGroup.get('paymentAmount')?.setValue(0);
        this._paymentDistribution = [];
    }


    private _loadCharges() {
        this.charges = [];
        const qb = RequestQueryBuilder.create({
            search: {
                studentId: Number(this.studentId),
                amountRemaining: { $gt: 0 }
            },
            sort: { field: 'amountRemaining', order: 'ASC' },
        }).query();

        const chargersAPI = new BaseHttp(`chargers?${qb}`, this.http);
        chargersAPI.get<Charge[]>().subscribe(result => {
            this.charges = result.sort((a, b) => new Date(a.chargeDate).getTime() - new Date(b.chargeDate).getTime());
            this.formGroup.patchValue({ paymentAmount: this.getTotalDebt() });
            this.formGroup.markAsDirty();
            setTimeout(() => setFocus('paymentAmount'), 50);
        });
    }

    getTotalDebt(): number {
        const total = this.charges.reduce((sum, charge) => sum + charge.amountRemaining, 0);
        return Number(total.toFixed(2));
    }

    updatePaymentDistribution() {
        let remainingPayment = this.formGroup.get('paymentAmount')?.value ?? 0;
        this._paymentDistribution = [];

        for (let charge of this.charges) {
            const chargeAmount = charge.amountRemaining;
            if (remainingPayment <= 0) {
                this._paymentDistribution.push(0);
            } else if (remainingPayment >= chargeAmount) {
                this._paymentDistribution.push(chargeAmount);
                remainingPayment -= chargeAmount;
            } else {
                this._paymentDistribution.push(remainingPayment);
                remainingPayment = 0;
            }
        }
    }

    isChargeCovered(index: number): boolean {
        return this._paymentDistribution[index] > 0;
    }

    isChargePartiallyCovered(index: number): boolean {
        const charge = this.charges[index];
        return this._paymentDistribution[index] > 0 &&
            this._paymentDistribution[index] < charge.amountRemaining;
    }

    getCoveredAmount(index: number): number {
        const covered = this._paymentDistribution[index] || 0;
        return Number(covered.toFixed(2));
    }

    getRemainingAfterPayment(index: number): number {
        const charge = this.charges[index];
        const remaining = charge.amountRemaining - (this._paymentDistribution[index] || 0);
        return Number(remaining.toFixed(2));
    }

    getCoveredPercentage(index: number): number {
        const charge = this.charges[index];
        const percentage = (this._paymentDistribution[index] / charge.amountRemaining) * 100;
        return Number(percentage.toFixed(2));
    }

    payFullAmount() {
        this.formGroup.get('paymentAmount')?.setValue(this.getTotalDebt());
        this.updatePaymentDistribution();
    }

    onDiscard() {
        this.complete.emit(false);
    }

    async onSubmit(): Promise<void> {
        const paymentAmount = this.formGroup.get('paymentAmount')?.value ?? 0;
        if (!(paymentAmount > 0 && paymentAmount <= this.getTotalDebt())) {
            return;
        }

        const body: CreatePaymentDto = { studentId: this.studentId, amount: paymentAmount };
        const payment = await firstValueFrom(new BaseHttp(`payments`, this.http).post<CreatePaymentDto, { id: number }>(body));
        const studentPayment = await firstValueFrom(new BaseHttp(`payments/${payment.id}/charges`, this.http).get<StudentPayment>());
        if (this.downloadVoucher.value) {
            await VoucherHelper.download(studentPayment, this.schoolService.value);
        }

        this.complete.emit(true);
    }

    onAutoDownloadChange() {
        this.downloadVoucher.value = !this.downloadVoucher.value;
    }
}