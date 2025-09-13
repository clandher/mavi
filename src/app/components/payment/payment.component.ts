import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Charge, CreatePaymentDto } from '@app/core/dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseHttp } from '@app/core/base-http';
import { RequestQueryBuilder } from '@dataui/crud-request';
import { StudentPayment } from '../students/student-payments.component';
import { VoucherHelper } from '@app/core/voucher.helper';
import { CurrencyMXPipe } from "../../core/currency-mx.pipe";

@Component({
    selector: 'app-payment',
    templateUrl: './payment.component.html',
    imports: [CommonModule, FormsModule, CurrencyMXPipe],
    standalone: true
})
export class PaymentComponent implements OnChanges {
    @Input() studentId!: number;
    @Output() complete = new EventEmitter<boolean>();

    charges: Charge[] = [];
    paymentAmount: number = 0;
    private _paymentDistribution: number[] = [];

    // Preferencia de descarga automática del voucher
    autoDownloadVoucher: boolean = true;

    constructor(private http: HttpClient) {
        this.loadPreferences();
    }

    ngOnChanges(changes: SimpleChanges) {
        this._loadCharges();
        this.paymentAmount = 0;
        this._paymentDistribution = [];
    }

    // Cargar preferencia desde localStorage
    loadPreferences() {
        const prefs = localStorage.getItem('preferences');
        if (prefs) {
            try {
                const obj = JSON.parse(prefs);
                this.autoDownloadVoucher = obj.autoDownloadVoucher !== undefined ? obj.autoDownloadVoucher : true;
            } catch {
                this.autoDownloadVoucher = true;
            }
        }
    }

    // Guardar preferencia en localStorage
    onAutoDownloadChange() {
        const prefs = localStorage.getItem('preferences');
        let obj: any = {};
        if (prefs) {
            try {
                obj = JSON.parse(prefs);
            } catch {}
        }
        obj.autoDownloadVoucher = this.autoDownloadVoucher;
        localStorage.setItem('preferences', JSON.stringify(obj));
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
        });
    }

    getTotalDebt(): number {
    const total = this.charges.reduce((sum, charge) => sum + charge.amountRemaining, 0);
    return Number(total.toFixed(2));
    }

    updatePaymentDistribution() {
        let remainingPayment = this.paymentAmount ?? 0;
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
        this.paymentAmount = this.getTotalDebt();
        this.updatePaymentDistribution();
    }

    onClose() {
        this.complete.emit(false);
    }

    onSave() {
        if (this.paymentAmount > 0 && this.paymentAmount <= this.getTotalDebt()) {
            const body: CreatePaymentDto = {
                studentId: this.studentId,
                amount: this.paymentAmount,
            };

            const paymentsAPI = new BaseHttp(`payments`, this.http);
            paymentsAPI.post<CreatePaymentDto, { id: number }>(body).subscribe(payment => {
                const paymentChargesAPI = new BaseHttp(`payments/${payment.id}/charges`, this.http);
                paymentChargesAPI.get<StudentPayment>().subscribe((studentPayment: StudentPayment) => {
                    // Descargar voucher solo si la preferencia está activa
                    if (this.autoDownloadVoucher) {
                        VoucherHelper.download(studentPayment);
                    }
                    this.complete.emit(true);
                })
            });
        }
    }
}