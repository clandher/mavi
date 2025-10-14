import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentPayment } from '@app/core/dto';
import { StudentPaymentHttp } from 'src/app/core/student-payment-http';
import { PaymentComponent } from "../payment/payment.component";
import { VoucherHelper } from '@app/core/voucher.helper';
import { CurrencyMXPipe } from "../../core/currency-mx.pipe";
import { SchoolService } from '@app/core/school.service';
import { StudentService } from '@app/core/student.service';
import { ModalService } from '@app/core/modal.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
	standalone: true,
	imports: [CommonModule, CurrencyMXPipe],
	templateUrl: './student-payments.component.html',
	providers: []
})
export class StudentPaymentsComponent implements OnInit, OnDestroy {

	paymentsWithChargers: StudentPayment[] = [];
	studentId: number | null = null;
	public showVoucherModal: boolean = false;
	public voucherPayment: StudentPayment | null = null;
	private destroy$ = new Subject<void>();

	constructor(
		private http: HttpClient,
		private route: ActivatedRoute,
		private router: Router,
		private schoolService: SchoolService,
		private studentService: StudentService,
		private modalService: ModalService,
	) {

		this.studentId = Number(this.route.parent!.snapshot.paramMap.get('id'));

	}

	ngOnInit(): void {
		this._loadPayments();
	}

	private _loadPayments() {
		const paymentHttp = new StudentPaymentHttp(this.http);
		paymentHttp.getByStudentWithChargers(+this.studentId!).subscribe(data => {
			this.paymentsWithChargers = data;
			// this.previewVoucher(this.paymentsWithChargers[0]);
		});
	}


	public openPaymentModal() {
		this.modalService.open({
			component: PaymentComponent, title: 'Realizar pago', size: 'md',
			inputs: { studentId: this.studentId }
		}).pipe(takeUntil(this.destroy$)).subscribe((result: boolean) => {
			if (result) {
				this._loadPayments();
				this.studentService.notifyRefresh();
			}
		});
	}

	async generateVoucher(studentPayment: StudentPayment) {
		await VoucherHelper.download(studentPayment, this.schoolService.value);
	}

	previewVoucher(studentPayment: StudentPayment) {
		this.voucherPayment = studentPayment;
		this.showVoucherModal = true;
		setTimeout(async () => {
			const canvas = await VoucherHelper.buildVoucherCanvas(studentPayment, this.schoolService.value);
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

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
