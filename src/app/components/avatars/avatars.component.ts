import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseHttp, buildUrl } from '@app/core/base-http';
import { Activity, Category, Student, StudentActivity } from '@app/core/dto';
import { RequestQueryBuilder } from '@dataui/crud-request';
import { PaymentComponent } from "../payment/payment.component";
import { InscriptionComponent } from '../inscription';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityComponent } from "../activity/activity.component";
import { uploadStudentPhoto } from '@app/core/helpers';
import { ObservationsComponent } from "../observations";
import { CurrencyMXPipe } from "../../core/currency-mx.pipe";

@Component({
	standalone: true,
	imports: [CommonModule, FormsModule, PaymentComponent, InscriptionComponent, ActivityComponent, ObservationsComponent, CurrencyMXPipe],
	templateUrl: './avatars.component.html',
	styleUrl: './avatars.component.scss'
})
export class AvatarsComponent {



	public showDebt: boolean = true;

	public selectedStudentActivity: StudentActivity | null = null;
	public showSubmenu: { [key: string]: boolean } = {};
	public showModal: boolean = false;


	public categories: Category[] = [];

	public activitiesByCategory: Activity[] = [];
	public activities: Activity[] = [];
	newActivityId: number | null = null;

	public studentActivities: StudentActivity[] = [];

	selectedCategoryId: number | null = null;
	selectedActivityId: number = 0;
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


	onCategoryChange() {



		this._filterActivities();
	}


	private _filterActivities() {

		this.activitiesByCategory = this.activities.filter(a => a.categoryId === this.selectedCategoryId);

		if (this.activitiesByCategory.length) {
			console.log('Activities for this category', this.activitiesByCategory);
			if (this.selectedActivityId && this.activitiesByCategory.some(a => a.id === this.selectedActivityId)) {
				this.onActivityChange(this.selectedActivityId, 0);
			} else {
				this.onActivityChange(this.activitiesByCategory[0].id, 0);
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
	}

	// Método para seleccionar un avatar
	selectAvatar(avatar: any | null): void {
		this.selectedStudentActivity = this.selectedStudentActivity === avatar ? null : avatar;
		this.showSubmenu['inscribir'] = false;
		this.showSubmenu['Observaciones'] = false;
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





	public newStudentModalVisible: boolean = false;
	public newEventModalVisible: boolean = false;
	public showObservations: boolean = false;




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
			const activities = new BaseHttp(`activities`, this.http);
			activities.get<Activity[]>().subscribe(result => {
				this.activities = result;
				this._filterActivities();
			});
		}
	}

	onObservations(): void {
		this.showObservations = true;
	}

	onObservationsComplete(value: boolean): void {
		this.showObservations = false;
		// if (value) {
		// 	const activities = new BaseHttp(`activities`, this.http);
		// 	activities.get<Activity[]>().subscribe(result => {
		// 		this.activities = result;
		// 	});
		// }
	}


	onPhotoSelected($event: Event) {
		if (this.selectedStudentActivity?.student) {
			uploadStudentPhoto($event, this.selectedStudentActivity?.student, this.http);
		}
	}

	getNonRecurrentActivitiesForStudent(studentActivity: StudentActivity): Activity[] {
		// if (!studentActivity.student || !this.activities) return [];
		const enrolledActivityIds = (studentActivity.student.activities || [])
			.filter(sa => sa.student.id === studentActivity.student.id)
			.map(sa => sa.activity.id);

		return this.activities.filter(activity => !activity.type.recurrent &&
			!enrolledActivityIds.includes(activity.id)
		);
	}


	// Método para alternar la visibilidad de un submenú
	toggleSubmenu(option: string, studentActivity: StudentActivity): void {
		this.showSubmenu[option] = !this.showSubmenu[option];

		if ('inscribir' === option) {
			const queryString = RequestQueryBuilder.create({
				search: { studentId: studentActivity.student.id },
			}).query();

			new BaseHttp(`student-activities?${queryString}`, this.http).get<StudentActivity[]>().subscribe(activities => {
				studentActivity.student.activities = activities;
			});
		}
	}


	async onInscribir(student: Student, activity: Activity): Promise<void> {
		console.log('student.categories', student.categories);

		const queryString = RequestQueryBuilder.create({
			search: { studentId: student.id },
		}).query();

		const studentCategories = await new BaseHttp(`student-categories?${queryString}`, this.http).get<Category[]>().toPromise() ?? [];

		const hasCategory = studentCategories.some(sc => sc.id === activity.categoryId);
		if (!hasCategory) {
			const studentCategoriesAPI = new BaseHttp(`student-categories`, this.http);
			await studentCategoriesAPI.post({ studentId: student.id, categoryId: activity.categoryId }).toPromise();
		}

		const body = {
			studentId: student.id,
			activityId: activity.id,
		};

		await new BaseHttp('student-activities', this.http)
			.post<typeof body, StudentActivity>(body)
			.toPromise();
	}

	ngAfterViewInit() {
		// setTimeout(() => {
		// 	this.onNewActivity();
		// }, 0);
	}
}
