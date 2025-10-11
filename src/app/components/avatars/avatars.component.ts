import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseHttp, buildUrl } from '@app/core/base-http';
import { Activity, Category, Student, StudentActivity, StudentCategory } from '@app/core/dto';
import { RequestQueryBuilder } from '@dataui/crud-request';
import { PaymentComponent } from "../payment/payment.component";
import { InscriptionComponent } from '../inscription';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ActivityComponent } from "../activity/activity.component";
import { uploadStudentPhoto } from '@app/core/helpers';
import { ObservationsComponent } from "../observations";
import { CurrencyMXPipe } from "../../core/currency-mx.pipe";
import { ImageHttpClient } from '@app/core/image-http-client';
import { ToastrService } from 'ngx-toastr';
import { AvatarStudentActivityComponent, StudentActivityEvent, StudentActivityView } from "./avatar-student-activity/avatar-student-activity.component";
import { ActivitySelectorComponent } from "../activity-selector/activity-selector.component";

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, FormsModule, PaymentComponent, InscriptionComponent, ActivityComponent, ObservationsComponent, CurrencyMXPipe, AvatarStudentActivityComponent, ActivitySelectorComponent],
	templateUrl: './avatars.component.html',
	styleUrl: './avatars.component.scss'
})
export class AvatarsComponent {
	onDebt($event: boolean) {
		this.showDebt = $event
	}

	public showDebt: boolean = true;

	public selectedStudentActivity: StudentActivityView | null = null;

	public showInscriptionModal: boolean = false;
	public showPaymentModal: boolean = false;
	public showObservationsModal: boolean = false;

	public studentActivities: StudentActivityView[] = [];
	public selectedActivity: Activity | null = null;

	constructor(
		public router: Router,
		private route: ActivatedRoute,
		private http: HttpClient,
		private imageHttp: ImageHttpClient,
		private toastr: ToastrService,
	) {


	}

	public onActivitySelect(activity: Activity | null): void {
		this.selectedActivity = activity;

		if (activity) {
			this._loadStudentActivities();
		} else {
			this.studentActivities = [];
		}
	}

	public showInscription() {
		this.selectedStudentActivity = new StudentActivity();
		this.showInscriptionModal = true;
	}

	public onPaymentComplete(value: boolean): void {
		this.showPaymentModal = false;

		if (value) {
			this._loadStudentActivities();
		}
	}

	public onInscriptionComplete(value: boolean): void {
		this.showInscriptionModal = false;

		if (value) {
			this._loadStudentActivities();
		}
	}

	public onPhotoSelected($event: Event) {
		if (this.selectedStudentActivity?.student) {
			uploadStudentPhoto($event, this.selectedStudentActivity?.student, this.http, this.toastr);
		}
	}

	public onStudentActivitySelect(event: { event: StudentActivityEvent, value: any }, selectedStudentActivity: StudentActivityView): void {
		this.selectedStudentActivity = selectedStudentActivity;

		switch (event.event) {
			case 'PAYMENT':
				this.showPaymentModal = true;
				break;
			case 'UPLOAD_PHOTO':
				document.getElementById('photo')?.click();
				break;
			case 'OBSERVATIONS':
				this.showObservationsModal = true;
				break;
		}
	}

	private _loadStudentActivities() {
		if (this.selectedActivity) {
			const queryString = RequestQueryBuilder.create({
				search: { activityId: Number(this.selectedActivity.id) },
			}).query();

			const studentActivitiesAPI = new BaseHttp(`student-activities?${queryString}`, this.http);
			studentActivitiesAPI.get<StudentActivity[]>().subscribe(studentActivities => {
				this.studentActivities = studentActivities.map(studentActivity => {
					studentActivity.debtActivityAmount = studentActivity.charges?.reduce((acc, charge) => acc + charge.amountRemaining, 0) || 0;
					this.imageHttp.student(studentActivity.student);
					return studentActivity;
				});
			});
		}
	}
}
