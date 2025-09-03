import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Charge, CreatePaymentDto } from '@app/core/dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseHttp } from '@app/core/base-http';
import { RequestQueryBuilder } from '@dataui/crud-request';
import { StudentPayment } from '../students/student-payments.component';
import { VoucherHelper } from '@app/core/voucher.helper';

@Component({
    selector: 'app-payment',
    templateUrl: './payment.component.html',
    //   styleUrl: './payment.component.scss',
    imports: [CommonModule, FormsModule],
    standalone: true
})
export class PaymentComponent implements OnChanges {
    @Input() studentId!: number;
    @Output() complete = new EventEmitter<boolean>();

    charges: Charge[] = [];
    paymentAmount: number = 0;
    paymentDistribution: number[] = [];

    constructor(private http: HttpClient) { }

    ngOnChanges(changes: SimpleChanges) {
        this.loadCharges();
        this.paymentAmount = 0;
        this.paymentDistribution = [];
    }

    loadCharges() {
        this.charges = [];
        const qb = RequestQueryBuilder.create({
            search: {
                studentId: Number(this.studentId),
                amountRemaining: { $gt: 0 }
            },
            sort: { field: 'amountRemaining', order: 'ASC' },
        }).query();


        // const qb = RequestQueryBuilder.create()
        //     .sortBy({ field: 'amountRemaining', order: 'ASC' }).query();


        const chargersAPI = new BaseHttp(`chargers?${qb}`, this.http);
        chargersAPI.get<Charge[]>().subscribe(result => {
            this.charges = result.sort((a, b) => new Date(a.chargeDate).getTime() - new Date(b.chargeDate).getTime());
        });
    }

    getTotalDebt(): number {
        return this.charges.reduce((total, charge) => total + charge.amountRemaining, 0);
    }

    updatePaymentDistribution() {
        let remainingPayment = this.paymentAmount ?? 0;
        this.paymentDistribution = [];

        // Distribuye el pago empezando por los cargos más antiguos
        for (let charge of this.charges) {
            const chargeAmount = charge.amountRemaining;
            if (remainingPayment <= 0) {
                this.paymentDistribution.push(0);
            } else if (remainingPayment >= chargeAmount) {
                this.paymentDistribution.push(chargeAmount);
                remainingPayment -= chargeAmount;
            } else {
                this.paymentDistribution.push(remainingPayment);
                remainingPayment = 0;
            }
        }
    }

    isChargeCovered(index: number): boolean {
        return this.paymentDistribution[index] > 0;
    }

    isChargePartiallyCovered(index: number): boolean {
        const charge = this.charges[index];
        return this.paymentDistribution[index] > 0 &&
            this.paymentDistribution[index] < charge.amountRemaining;
    }

    getCoveredAmount(index: number): number {
        return this.paymentDistribution[index] || 0;
    }

    getRemainingAfterPayment(index: number): number {
        const charge = this.charges[index];
        return charge.amountRemaining - (this.paymentDistribution[index] || 0);
    }

    getCoveredPercentage(index: number): number {
        const charge = this.charges[index];
        return (this.paymentDistribution[index] / charge.amountRemaining) * 100;
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
            // this.http.post<{ id: number }>(`/api/payments`, body).subscribe(payment => {
            //     this.http.get(`/api/payments/${payment.id}/charges`).subscribe(paymentCharges => {
            //         // Aquí podrías generar el voucher si lo necesitas
            //         this.paymentCompleted.emit({ payment, paymentCharges });
            //         this.onClose();
            //     });
            // });

            const paymentsAPI = new BaseHttp(`payments`, this.http);
            paymentsAPI.post<CreatePaymentDto, { id: number }>(body).subscribe(payment => {
                const paymentChargesAPI = new BaseHttp(`payments/${payment.id}/charges`, this.http);
                paymentChargesAPI.get<StudentPayment>().subscribe((studentPayment: StudentPayment) => {
                    VoucherHelper.download(studentPayment);
                    this.complete.emit(true);
                })
            });
        }
    }




}