import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseHttp } from '@app/core/base-http';
import { Charge, Student } from '@app/core/dto';
import { RequestQueryBuilder } from '@dataui/crud-request';
import { StudentPaymentHttp } from 'src/app/core/student-payment-http';
import { PaymentComponent } from "../payment/payment.component";

@Component({
  standalone: true,
  imports: [CommonModule, PaymentComponent],
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
    const paymentHttp = new StudentPaymentHttp(this.http);
    paymentHttp.getByStudentWithChargers(+this.studentId!).subscribe(data => {
      this.paymentsWithChargers = data;
    });
  }

  public showPaymentModal: boolean = false;

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