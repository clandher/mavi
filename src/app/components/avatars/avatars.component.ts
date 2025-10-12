import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseHttp } from '@app/core/base-http';
import { Activity, StudentActivity } from '@app/core/dto';
import { RequestQueryBuilder } from '@dataui/crud-request';
import { PaymentComponent } from "../payment/payment.component";
import { InscriptionComponent } from '../inscription';
import { Router, RouterModule } from '@angular/router';
import { uploadStudentPhoto } from '@app/core/helpers';
import { ObservationsComponent } from "../observations";
import { ImageHttpClient } from '@app/core/image-http-client';
import { ToastrService } from 'ngx-toastr';
import { AvatarStudentActivityComponent, StudentActivityEvent, StudentActivityView } from "./avatar-student-activity/avatar-student-activity.component";
import { ActivitySelectorComponent } from "../activity-selector/activity-selector.component";
import { ModalService } from '@app/core/modal.service';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, FormsModule, PaymentComponent, ObservationsComponent, AvatarStudentActivityComponent, ActivitySelectorComponent],
	templateUrl: './avatars.component.html',
	styleUrl: './avatars.component.scss'
})
export class AvatarsComponent {

	public showDebt: boolean = true;

	public selectedStudentActivity: StudentActivityView | null = null;

	public showPaymentModal: boolean = false;
	public showObservationsModal: boolean = false;

	public studentActivities: StudentActivityView[] = [];
	public loadingStudentActivities: boolean = false;

	public selectedActivity: Activity | null = null;

	constructor(
		public router: Router,
		private http: HttpClient,
		private imageHttp: ImageHttpClient,
		private toastr: ToastrService,
		private modalService: ModalService,
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
		this.modalService.open({ component: InscriptionComponent, title: 'Inscribir alumnos', size: 'xl' }).subscribe((result: boolean) => {
			if (result) {
				this._loadStudentActivities();
			}
		});
	}

	public onPaymentComplete(value: boolean): void {
		this.showPaymentModal = false;

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

	public onDebt($event: boolean) {
		this.showDebt = $event
	}

	private _loadStudentActivities() {
		if (this.selectedActivity) {
			const queryString = RequestQueryBuilder.create({
				search: { activityId: Number(this.selectedActivity.id) },
			}).query();

			const studentActivitiesAPI = new BaseHttp(`student-activities?${queryString}`, this.http);
			this.loadingStudentActivities = true;
			studentActivitiesAPI.get<StudentActivity[]>().subscribe(studentActivities => {
				this.studentActivities = studentActivities.map(studentActivity => {
					studentActivity.debtActivityAmount = studentActivity.charges?.reduce((acc, charge) => acc + charge.amountRemaining, 0) || 0;
					this.imageHttp.student(studentActivity.student);
					return studentActivity;
				});
				this.loadingStudentActivities = false;
			});
		}
	}
}
