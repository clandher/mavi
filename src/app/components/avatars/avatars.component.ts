import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseHttp, buildUrl } from '@app/core/base-http';
import { Activity, ActivityType, ApiRes, Category, CreateActivityDto, Student, StudentActivity } from '@app/core/dto';
import { RequestQueryBuilder } from '@dataui/crud-request';
import { PaymentComponent } from "../payment/payment.component";
import { InscriptionComponent } from '../inscription';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityComponent } from "../activity/activity.component";

@Component({
	standalone: true,
	imports: [CommonModule, FormsModule, PaymentComponent, InscriptionComponent, ActivityComponent],
	templateUrl: './avatars.component.html',
	styleUrl: './avatars.component.scss'
})
export class AvatarsComponent {

	public showDebt: boolean = true;

	public selectedStudentActivity: StudentActivity | null = null;
	public showSubmenu: { [key: string]: boolean } = {};
	public showModal: boolean = false;


	public categories: Category[] = [];
	newCategoryId: number | null = null;

	public newActivities: Activity[] = [];
	public activities: Activity[] = [];
	newActivityId: number | null = null;

	public studentActivities: StudentActivity[] = [];


	selectedCategoryId: number | null = null;
	selectedActivityId: number | null = null;
	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private http: HttpClient,
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

		const categories = new BaseHttp(`categories`, this.http);
		categories.get<Category[]>().subscribe(result => {
			this.categories = result;

			if (this.categories.length > 0 && !this.selectedCategoryId) {
				this.selectedCategoryId = this.categories[0].id;
			}

			this.onCategoryChange();
		});
	}


	onNewCategoryChange() {

		const queryString = RequestQueryBuilder.create({
			search: { categoryId: Number(this.newCategoryId!) },
		}).query();

		const activities = new BaseHttp(`activities?${queryString}`, this.http);
		activities.get<ApiRes<Activity>>().subscribe(result => {
			this.newActivities = result.data;
		});
	}

	onCategoryChange() {

		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: { category: this.selectedCategoryId, activity: this.selectedActivityId },
			queryParamsHandling: 'merge'
		});


		this._loadActivities();
	}


	private _loadActivities() {

		const queryString = RequestQueryBuilder.create({
			search: { categoryId: Number(this.selectedCategoryId!) },
		}).query();


		const activities = new BaseHttp(`activities?${queryString}`, this.http);
		activities.get<Activity[]>().subscribe(result => {
			this.activities = result;
			this.newActivities = [...this.activities];

			if (this.activities.length) {

				if (this.selectedActivityId && this.activities.some(a => a.id === this.selectedActivityId)) {
					this.onActivityChange(this.selectedActivityId, 0);
				} else {
					this.onActivityChange(this.activities[0].id, 0);
				}

			}
		});
	}

	onActivityChange(activityId: number, index: number): void {

		this.selectedActivityId = activityId;
		this.selectedStudentActivity = null;


		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: { category: this.selectedCategoryId, activity: this.selectedActivityId },
			queryParamsHandling: 'merge'
		});

		setTimeout(() => {
			const buttons = document.querySelectorAll('button');
			const selectedButton = buttons[index] as HTMLElement;

			if (selectedButton) {
				this.highlightWidth = selectedButton.offsetWidth + 12;
				this.highlightPosition = selectedButton.offsetLeft - 6;
			}
		}, 50);


		this._loadStudentActivities();
	}




	private _loadStudentActivities() {
		const queryString = RequestQueryBuilder.create({
			search: { activityId: Number(this.selectedActivityId) },
		}).query();

		const studentActivitiesAPI = new BaseHttp(`student-activities?${queryString}`, this.http);
		studentActivitiesAPI.get<StudentActivity[]>().subscribe(studentActivities => {
			this.studentActivities = studentActivities.map(studentActivity => {
				// studentActivity.debtActivity = studentActivity.charges?.some(charge => charge.amountRemaining > 0);
				studentActivity.debtActivityAmount = studentActivity.charges?.reduce((acc, charge) => acc + charge.amountRemaining, 0) || 0;

				if (studentActivity.student.photo) {
					studentActivity.student.photoUrl = buildUrl(`students/${studentActivity.student.id}/photo`);
				}

				return studentActivity;
			});
		});
	}

	addNewAvatar() {
		this.selectedStudentActivity = new StudentActivity();

		this.showModal = true;

		this.newCategoryId = this.selectedCategoryId;
	}

	// Método para seleccionar un avatar
	selectAvatar(avatar: any | null): void {
		this.selectedStudentActivity = this.selectedStudentActivity === avatar ? null : avatar;
	}

	// Método para alternar la visibilidad de un submenú
	toggleSubmenu(option: string): void {
		this.showSubmenu[option] = !this.showSubmenu[option];
	}

	// Método para abrir el modal de edición
	openEditModal(studentActivity: StudentActivity): void {
		this.router.navigate([`/app/estudiantes/${studentActivity.student.id}/editar/info`]);
		this.selectedStudentActivity = { ...studentActivity }; // Clonamos para no modificar directamente
	}

	closeModal(): void {
		this.showModal = false;
	}



	highlightWidth = 0;
	highlightPosition = 0;

	public showPaymentModal: boolean = false;

	onPaymentComplete(value: boolean): void {
		this.showPaymentModal = false;

		if (value) {
			this._loadStudentActivities();
		}
	}



	onInscriptionComplete(value: boolean): void {
		this.showModal = false;

		if (value) {
			this._loadStudentActivities();
		}

	}

	closePaymentModal() {
		this.showPaymentModal = false;
	}





	public newEventModalVisible: boolean = false;




	// Selecciona la categoría anterior, si es la primera va a la última
	selectPreviousCategory(): void {
		const idx = this.categories.findIndex(c => c.id === this.selectedCategoryId);
		if (idx > 0) {
			this.selectedCategoryId = this.categories[idx - 1].id;
		} else if (idx === 0) {
			this.selectedCategoryId = this.categories[this.categories.length - 1].id;
		}
		this.onCategoryChange();
	}

	// Selecciona la siguiente categoría, si es la última va a la primera
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
		this.newEventModalVisible = true;
	}

	onEditActivity(): void {
		if (this.selectedActivityId) {
			this.newActivityId = this.selectedActivityId;
			this.newEventModalVisible = true;
		}
	}

	onActivityComplete(value: boolean): void {
		this.newEventModalVisible = false;
		if (value) {
			this._loadActivities();
		}
	}
}
