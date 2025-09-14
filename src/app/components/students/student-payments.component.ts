import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentPayment } from '@app/core/dto';
import { StudentPaymentHttp } from 'src/app/core/student-payment-http';
import { PaymentComponent } from "../payment/payment.component";
import { VoucherHelper } from '@app/core/voucher.helper';
import { CurrencyMXPipe } from "../../core/currency-mx.pipe";
import { SchoolService } from '@app/core/school.service';

@Component({
	standalone: true,
	imports: [CommonModule, PaymentComponent, CurrencyMXPipe],
	templateUrl: './student-payments.component.html',
	providers: []
})
export class StudentPaymentsComponent implements OnInit {

	paymentsWithChargers: StudentPayment[] = [];
	studentId: string | null = null;
	public showVoucherModal: boolean = false;
	public voucherPayment: StudentPayment | null = null;

	constructor(
		private http: HttpClient,
		private route: ActivatedRoute,
		private router: Router,
		private schoolService: SchoolService
	) {

		this.studentId = this.route.parent!.snapshot.paramMap.get('id');

	}

	ngOnInit(): void {
		this._loadPayments();
	}


	public showPaymentModal: boolean = false;

	private _loadPayments() {
		const paymentHttp = new StudentPaymentHttp(this.http);
		paymentHttp.getByStudentWithChargers(+this.studentId!).subscribe(data => {
			this.paymentsWithChargers = data.reverse();
			this.previewVoucher(this.paymentsWithChargers[0]);
		});
	}

	onPaymentComplete(value: boolean) {
		this.showPaymentModal = false;

		if (value) {
			this._loadPayments();
		}
	}

	generateVoucher(studentPayment: StudentPayment) {
		VoucherHelper.download(studentPayment, this.schoolService.school);
	}

	previewVoucher(studentPayment: StudentPayment) {
		this.voucherPayment = studentPayment;
		this.showVoucherModal = true;
		setTimeout(() => {
			const canvas = VoucherHelper.buildVoucherCanvas(studentPayment, this.schoolService.school);
			const container = document.getElementById('voucher-preview-canvas');
			if (container) {
				container.innerHTML = '';
				container.appendChild(canvas);
			}
		}, 0);
	}

	closeVoucherModal() {
		this.showVoucherModal = false;
		this.voucherPayment = null;
		const container = document.getElementById('voucher-preview-canvas');
		if (container) container.innerHTML = '';
	}

}
