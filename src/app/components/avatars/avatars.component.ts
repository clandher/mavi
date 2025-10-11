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

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, FormsModule, PaymentComponent, InscriptionComponent, ActivityComponent, ObservationsComponent, CurrencyMXPipe, AvatarStudentActivityComponent],
	templateUrl: './avatars.component.html',
	styleUrl: './avatars.component.scss'
})
export class AvatarsComponent {

	public showDebt: boolean = true;

	public selectedStudentActivity: StudentActivityView | null = null;

	public showInscriptionModal: boolean = false;
	public showPaymentModal: boolean = false;
	public showActivityModal: boolean = false;
	public showObservationsModal: boolean = false;


	public categories: Category[] = [];

	public activitiesByCategoryCurrent: Activity[] = [];
	public activitiesByCategoryPast: Activity[] = [];
	public activities: Activity[] = [];
	newActivityId: number | null = null;

	public studentActivities: StudentActivityView[] = [];

	selectedCategoryId: number | null = null;
	selectedActivityId: number = 0;
	showActivitieByCategoryPast: boolean = false;
	selectedActivityIsPast: boolean = false;


	constructor(
		public router: Router,
		private route: ActivatedRoute,
		private http: HttpClient,
		private imageHttp: ImageHttpClient,
		private toastr: ToastrService,
	) {

		this.route.queryParams.subscribe(params => {
			const categoryId = params['category'];
			const activityId = params['activity'];

			if (categoryId) {
				this.selectedCategoryId = +categoryId;
			}
			if (activityId) {
				this.selectedActivityId = +activityId;
			}
		});




		Promise.all([
			new BaseHttp(`categories`, this.http).get<Category[]>().toPromise(),
			new BaseHttp(`activities`, this.http).get<Activity[]>().toPromise()
		]).then(([categories, activities]) => {
			this.categories = categories || [];
			this.activities = activities || [];

			if (this.categories.length > 0 && !this.selectedCategoryId) {
				this.selectedCategoryId = this.categories[0].id;
			}

			this.onCategoryChange();
		});
	}


	async onCategoryChange() {


		this.activities = (await new BaseHttp(`activities`, this.http).get<Activity[]>().toPromise()) || [];
		this._filterActivities();

		setTimeout(() => {
			const selectedTab = document.querySelector('.mavi-tab.selected') as HTMLElement;
			if (selectedTab) {
				const event = new MouseEvent('click', { bubbles: true });
				selectedTab.dispatchEvent(event);
			}
		}, 100);
	}


	private _filterActivities() {

		this.activitiesByCategoryCurrent = this.activities.filter(a => a.categoryId === this.selectedCategoryId && new Date(a.endDate) >= new Date());
		this.activitiesByCategoryPast = this.activities.filter(a => a.categoryId === this.selectedCategoryId && new Date(a.endDate) < new Date());


		if (this.activitiesByCategoryCurrent.length || this.activitiesByCategoryPast.length) {
			if (this.selectedActivityId && this.activities.some(a => a.id === this.selectedActivityId && a.categoryId === this.selectedCategoryId)) {

				const selectedActivity = this.activities.find(a => a.id === this.selectedActivityId && a.categoryId === this.selectedCategoryId);
				this.selectedActivityIsPast = selectedActivity ? new Date(selectedActivity.endDate) < new Date() : false;

				this.onActivityChange(this.selectedActivityId);
			} else {
				if (this.activitiesByCategoryCurrent.length) {
					this.onActivityChange(this.activitiesByCategoryCurrent[0].id);
					return;
				} else {
					this.selectedActivityIsPast = new Date(this.activities[0].endDate) < new Date();
					this.onActivityChange(this.activities[0].id);
				}
			}
		} else {
			console.log('No activities for this category');
			this.selectedActivityId = 0;
			this.studentActivities = [];
		}

		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: { category: this.selectedCategoryId, activity: this.selectedActivityId },
			queryParamsHandling: 'merge'
		});
	}

	onActivityChange(activityId: number): void {

		this.selectedActivityId = activityId;
		this.selectedStudentActivity = null;


		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: { category: this.selectedCategoryId, activity: this.selectedActivityId },
			queryParamsHandling: 'merge'
		});

		this._loadStudentActivities();
	}


	private _loadStudentActivities() {
		const queryString = RequestQueryBuilder.create({
			search: { activityId: Number(this.selectedActivityId) },
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

	addNewAvatar() {
		this.selectedStudentActivity = new StudentActivity();
		this.showInscriptionModal = true;
	}

	onPaymentComplete(value: boolean): void {
		this.showPaymentModal = false;

		if (value) {
			this._loadStudentActivities();
		}
	}

	onInscriptionComplete(value: boolean): void {
		this.showInscriptionModal = false;

		if (value) {
			this._loadStudentActivities();
		}

	}

	onActivityComplete(value: boolean): void {
		this.showActivityModal = false;
		if (value) {
			const activities = new BaseHttp(`activities`, this.http);
			activities.get<Activity[]>().subscribe(result => {
				this.activities = result;
				this._filterActivities();
			});
		}
	}

	selectPreviousCategory(): void {
		const idx = this.categories.findIndex(c => c.id === this.selectedCategoryId);
		if (idx > 0) {
			this.selectedCategoryId = this.categories[idx - 1].id;
		} else if (idx === 0) {
			this.selectedCategoryId = this.categories[this.categories.length - 1].id;
		}
		this.onCategoryChange();
	}

	selectNextCategory(): void {
		const idx = this.categories.findIndex(c => c.id === this.selectedCategoryId);
		if (idx < this.categories.length - 1 && idx !== -1) {
			this.selectedCategoryId = this.categories[idx + 1].id;
		} else if (idx === this.categories.length - 1) {
			this.selectedCategoryId = this.categories[0].id;
		}
		this.onCategoryChange();
	}

	onNewActivity(): void {
		this.newActivityId = 0;
		this.showActivityModal = true;
	}

	onEditActivity(): void {
		if (this.selectedActivityId) {
			this.newActivityId = this.selectedActivityId;
			this.showActivityModal = true;
		}
	}

	public onPhotoSelected($event: Event) {
		if (this.selectedStudentActivity?.student) {
			uploadStudentPhoto($event, this.selectedStudentActivity?.student, this.http, this.toastr);
		}
	}

	private isDragging = false;
	private startX = 0;
	private scrollLeft = 0;

	onMouseDown(event: MouseEvent): void {
		const tabs = event.target as HTMLElement;
		if (!tabs.classList.contains('mavi-tabs')) return;

		this.isDragging = true;
		this.startX = event.pageX - tabs.offsetLeft;
		this.scrollLeft = tabs.scrollLeft;
		tabs.classList.add('dragging');
	}

	onMouseMove(event: MouseEvent): void {
		if (!this.isDragging) return;

		const tabs = document.querySelector('.mavi-tabs') as HTMLElement;
		if (!tabs) return;

		const x = event.pageX - tabs.offsetLeft;
		const walk = (x - this.startX) * 2; // Scroll speed multiplier
		tabs.scrollLeft = this.scrollLeft - walk;
	}

	onMouseUp(): void {
		this.isDragging = false;
		const tabs = document.querySelector('.mavi-tabs');
		tabs?.classList.remove('dragging');
	}

	centerTab(event: MouseEvent): void {
		const tab = event.target as HTMLElement;
		const tabsContainer = tab.closest('.mavi-tabs') as HTMLElement;
		if (!tabsContainer) return;

		const tabRect = tab.getBoundingClientRect();
		const containerRect = tabsContainer.getBoundingClientRect();

		const offset = tabRect.left - containerRect.left - (containerRect.width / 2) + (tabRect.width / 2);
		tabsContainer.scrollBy({ left: offset, behavior: 'smooth' });
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
}
