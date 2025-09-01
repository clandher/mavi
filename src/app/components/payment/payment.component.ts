import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Charge, CreatePaymentDto } from '@app/core/dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseHttp } from '@app/core/base-http';
import { RequestQueryBuilder } from '@dataui/crud-request';

@Component({
    selector: 'app-payment',
    templateUrl: './payment.component.html',
    //   styleUrl: './payment.component.scss',
    imports: [CommonModule, FormsModule],
    standalone: true
})
export class PaymentComponent implements OnChanges {
    @Input() studentId!: number;
    @Output() close = new EventEmitter<void>();

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
        const queryString = RequestQueryBuilder.create({
            search: {
                studentId: Number(this.studentId),
                amountRemaining: { $gt: 0 }
            },
        }).query();

        const chargersAPI = new BaseHttp(`chargers?${queryString}`, this.http);
        chargersAPI.get<Charge[]>().subscribe(result => {
            this.charges = result;
        });
    }

    getTotalDebt(): number {
        return this.charges.reduce((total, charge) => total + charge.amountRemaining, 0);
    }

    get sortedCharges() {
        return [...this.charges].sort((a, b) =>
            new Date(a.chargeDate).getTime() - new Date(b.chargeDate).getTime()
        );
    }


    updatePaymentDistribution() {
        let remainingPayment = this.paymentAmount ?? 0;
        this.paymentDistribution = [];

        // Distribuye el pago empezando por los cargos más antiguos
        for (let charge of this.sortedCharges) {
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
        const charge = this.sortedCharges[index];
        return this.paymentDistribution[index] > 0 &&
            this.paymentDistribution[index] < charge.amountRemaining;
    }

    getCoveredAmount(index: number): number {
        return this.paymentDistribution[index] || 0;
    }

    getRemainingAfterPayment(index: number): number {
        const charge = this.sortedCharges[index];
        return charge.amountRemaining - (this.paymentDistribution[index] || 0);
    }

    getCoveredPercentage(index: number): number {
        const charge = this.sortedCharges[index];
        return (this.paymentDistribution[index] / charge.amountRemaining) * 100;
    }

    payFullAmount() {
        this.paymentAmount = this.getTotalDebt();
        this.updatePaymentDistribution();
    }

    onClose() {
        this.close.emit();
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
                paymentChargesAPI.get().subscribe(paymentCharges => {
                    console.log('paymentCharges', paymentCharges);
                    this.generateVoucher(paymentCharges);
                    this.onClose();
                })
            });
        }
    }

    // Método para simular la descarga de un voucher (generación de una imagen)
    generateVoucher(paymentCharges: any): void {
        const voucherImage = this.createVoucherImage(paymentCharges);
        const a = document.createElement('a');
        a.href = voucherImage;
        a.download = 'voucher.png';
        a.click();
    }

    // Método para crear la imagen del voucher (simulación de descarga de imagen)
    createVoucherImage(paymentData: any): string {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (ctx) {
            // Increase canvas size for better layout
            canvas.width = 600;
            canvas.height = 400 + (paymentData.charges.length * 110); // Dynamic height based on charges

            // Background with border
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#4a86e8';
            ctx.lineWidth = 5;
            ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

            // Header
            ctx.fillStyle = '#4a86e8';
            ctx.fillRect(0, 0, canvas.width, 60);
            ctx.font = 'bold 28px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText('COMPROBANTE DE PAGO', canvas.width / 2, 40);

            // Reset text alignment
            ctx.textAlign = 'left';

            // Payment details
            const paymentDate = new Date(paymentData.paymentDate).toLocaleString();
            const formattedAmount = paymentData.amount.toFixed(2);

            // Main payment info
            ctx.font = 'bold 18px Arial';
            ctx.fillStyle = '#000000';
            ctx.fillText(`Estudiante ID: ${paymentData.studentId}`, 40, 100);
            ctx.fillText(`Fecha de pago: ${paymentDate}`, 40, 130);
            ctx.fillText(`Monto total: $${formattedAmount}`, 40, 160);

            // Charges breakdown header
            ctx.fillStyle = '#4a86e8';
            ctx.fillRect(40, 190, canvas.width - 80, 30);
            ctx.font = 'bold 16px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.fillText('DETALLE DE CARGOS', 50, 212);

            // Charges list
            let yPos = 240;
            paymentData.charges.forEach((charge: any, index: number) => {
                ctx.font = '14px Arial';
                ctx.fillStyle = '#000000';

                // Charge header
                ctx.fillText(`Cargo #${index + 1} (ID: ${charge.chargeId})`, 50, yPos);

                // Charge details
                ctx.fillText(`Monto pagado: $${charge.amount.toFixed(2)}`, 70, yPos + 25);
                ctx.fillText(`Monto original: $${charge.amountToBePaid.toFixed(2)}`, 70, yPos + 50);
                ctx.fillText(`Saldo pendiente: $${charge.amountRemaining.toFixed(2)}`, 70, yPos + 75);

                yPos += 110;
            });

            // Footer
            ctx.font = 'italic 12px Arial';
            ctx.fillStyle = '#666666';
            ctx.textAlign = 'center';
            ctx.fillText('Gracias por su pago', canvas.width / 2, yPos + 30);

            // Convert canvas to image URL
            return canvas.toDataURL('image/png');
        }

        return '';
    }



}