import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StudentActivityHttp } from 'src/app/core/student-activity-http'; // importa tu nueva clase
import { HttpClient } from '@angular/common/http';
import { CurrencyMXPipe } from "../../core/currency-mx.pipe";
import { Charge, StudentActivity } from '@app/core/dto';
import { ChargeComponent } from "../charge/charge.component";
import { DiscountTypeComponent } from '../discount-type/discount-type.component';
import { ModalService } from '@app/core/modal.service';
import { InscriptionComponent } from '../inscription';
import { DiscountComponent } from '../discount/discount.component';
import { StudentService } from '@app/core/student.service';

@Component({
	standalone: true,
	templateUrl: './student-activities.component.html',
	imports: [CommonModule, RouterModule, CurrencyMXPipe],
	providers: [HttpClient]
})
export class StudentActivitiesComponent implements OnInit {

	activities: StudentActivity[] = [];
	loading = true;
	private studentActivityHttp: StudentActivityHttp;
	private destroy$ = new Subject<void>();

	private studentId!: number;
	constructor(
		private route: ActivatedRoute,
		private http: HttpClient,
		private modalService: ModalService,
		private studentService: StudentService,
	) {
		this.studentId = +this.route.parent!.snapshot.paramMap.get('id')!;
		this.studentActivityHttp = new StudentActivityHttp(this.http);
	}

	ngOnInit() {
		this._fetch();
	}

	private _fetch() {
		this.studentActivityHttp.getByStudent(this.studentId)
			.subscribe({
				next: (data) => {
					this.activities = data;
					this.loading = false;
				},
				error: () => this.loading = false
			});
	}

	unsubscribeActivity(studentActivity: StudentActivity) {
		this.studentActivityHttp.unsubscribe(studentActivity.id).subscribe({
			next: () => {
				studentActivity.unsubscribed = true;
				studentActivity.unsubscribedDate = new Date();

			},
			error: () => {
			}
		});
	}

	onShowCharge(studentActivity: StudentActivity) {
		this.modalService.open({
			component: ChargeComponent, title: 'Nuevo cargo', size: 'sm',
			inputs: { studentActivityId: studentActivity.id },
		}).pipe(takeUntil(this.destroy$)).subscribe((result) => {
			if (result) {
				this.activities = [];
				const studentId = this.route.parent!.snapshot.paramMap.get('id');
				this.studentActivityHttp.getByStudent(+studentId!).subscribe({
					next: (data) => {
						this.activities = data;
					}
				});
			}
		});
	}

	openActivityModal() {
		this.modalService.open({
			component: InscriptionComponent, title: 'Inscribir alumnos', size: 'xl',
			inputs: { studentId: this.studentId }
		}).pipe(takeUntil(this.destroy$)).subscribe((result: boolean) => {
			if (result) {
				this._fetch();
				this.studentService.notifyRefresh();
			}
		});
	}
	
	openDiscountModal(charge: Charge) {
		this.modalService.open({
			component: DiscountComponent,
			title: 'Aplicar descuento',
			size: 'sm',
			inputs: { chargeId: charge.id || 0, amountRemaining: charge.amountRemaining }
		}).pipe(takeUntil(this.destroy$)).subscribe((result) => {
			if (result) {
				this._fetch();
				this.studentService.notifyRefresh();
			}
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
