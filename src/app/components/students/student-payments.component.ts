import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseHttp } from '@app/core/base-http';
import { Charge, Student } from '@app/core/dto';
import { RequestQueryBuilder } from '@dataui/crud-request';
import { StudentPaymentHttp } from 'src/app/core/student-payment-http';
import { PaymentComponent } from "../payment/payment.component";
import { VoucherHelper } from '@app/core/voucher.helper';
import { CurrencyMXPipe } from "../../core/currency-mx.pipe";

@Component({
  standalone: true,
  imports: [CommonModule, PaymentComponent, CurrencyMXPipe],
  templateUrl: './student-payments.component.html',
  providers: []
})
export class StudentPaymentsComponent implements OnInit {

  paymentsWithChargers: StudentPayment[] = [];

  studentId: string | null = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
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
      this.paymentsWithChargers = data;
    });
  }

  onPaymentComplete(value: boolean) {
    this.showPaymentModal = false;

    if (value) {
      this._loadPayments();
    }
  }

  generateVoucher(studentPayment: StudentPayment) {
    console.log('studentPayment', studentPayment);

    VoucherHelper.download(studentPayment);
  }

}


export interface Activity {
  id: number;
  categoryId: number;
  description: string;
  startDate: string;
  endDate: string;
  gracePeriod: number;
  price: number;
}

export interface Collection {
  id: number;
  studentId: number;
  chargeDate: string;
  amountToBePaid: number;
  amountRemaining: number;
  activityId: number;
  concept: string;
}

export interface PaymentCharge {
  id: number;
  amount: number;
  amountRemained: number;
  activityId: number;
  collection: Collection;
  activity: Activity;
}

export interface StudentPayment {
  id: number;
  studentId: number;
  amount: number;
  paymentDate: string;
  voucher: string;
  student: Student;
  paymentCharges: PaymentCharge[];
}