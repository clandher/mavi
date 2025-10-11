import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { BaseHttp } from '@app/core/base-http';
import { CurrencyMXPipe } from '@app/core/currency-mx.pipe';
import { Activity, StudentActivity, StudentCategory } from '@app/core/dto';
import { RequestQueryBuilder } from '@dataui/crud-request';
import { ToastrService } from 'ngx-toastr';

export interface StudentActivityView extends StudentActivity {
	unenrolledActivities?: Activity[];
}

export type StudentActivityEvent = 'PAYMENT' | 'UPLOAD_PHOTO' | 'OBSERVATIONS';

@Component({
	selector: 'app-avatar-student-activity',
	templateUrl: './avatar-student-activity.component.html',
	styleUrls: ['./avatar-student-activity.component.scss'],
	imports: [CommonModule, RouterModule, CurrencyMXPipe]
})
export class AvatarStudentActivityComponent {
	@Input() studentActivity!: StudentActivityView;
	@Input() showDebt!: boolean;
	@Input() activities: Activity[] = [];

	@Output() select = new EventEmitter<{ event: StudentActivityEvent, value: any }>();

	constructor(
		private http: HttpClient,
		public router: Router,
		private toastr: ToastrService,

	) { }

	public onSelectStudentActivity(studentActivity: StudentActivityView): void {

		if (!studentActivity.unenrolledActivities) {
			const queryString = RequestQueryBuilder.create({
				search: { studentId: studentActivity.student.id },
			}).query();

			new BaseHttp(`student-activities?${queryString}`, this.http).get<StudentActivity[]>().subscribe(enrolledActivities => {
				studentActivity.unenrolledActivities = this.activities.filter(activity => !activity.type.recurrent &&
					!enrolledActivities.some(ea => ea.activity.id === activity.id)
				);
			});
		}
	}

	async onInscription(activity: Activity): Promise<void> {

		const queryString = RequestQueryBuilder.create({
			search: { studentId: this.studentActivity.studentId },
		}).query();

		const studentCategories = await new BaseHttp(`student-categories?${queryString}`, this.http).get<StudentCategory[]>().toPromise() ?? [];

		const hasCategory = studentCategories.some(sc => sc.categoryId === activity.categoryId);
		if (!hasCategory) {
			const studentCategoriesAPI = new BaseHttp(`student-categories`, this.http);
			await studentCategoriesAPI.post({ studentId: this.studentActivity.studentId, categoryId: activity.categoryId }).toPromise();
		}

		const body = {
			studentId: this.studentActivity.studentId,
			activityId: activity.id,
		};

		await new BaseHttp('student-activities', this.http)
			.post<typeof body, StudentActivity>(body)
			.toPromise();

		if (this.studentActivity.unenrolledActivities) {
			this.studentActivity.unenrolledActivities = this.studentActivity.unenrolledActivities?.filter(a => a.id !== activity.id);
		}

		this.toastr.success('Inscripción realizada correctamente');
	}

	public onContextMenuOption(event: StudentActivityEvent, value?: any): void {
		this.select.emit({ event, value });
	}
}