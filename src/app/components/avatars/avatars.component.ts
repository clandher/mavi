import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseHttp } from '@app/core/base-http';
import { Activity, ActivityType, ApiRes, Category, Charge, CreateActivityDto, CreatePaymentDto, PaymentEntity, Student, StudentActivity } from '@app/core/dto';
import { RequestQueryBuilder } from '@dataui/crud-request';
import { PaymentComponent } from "../payment/payment.component";

@Component({
	selector: 'app-avatars',
	standalone: true,
	imports: [CommonModule, FormsModule, PaymentComponent],
	templateUrl: './avatars.component.html',
	styleUrl: './avatars.component.scss'
})
export class AvatarsComponent {
	// Función para generar un número aleatorio dentro de un rango
	public getRandomInRange(min: number, max: number) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	// Datos ficticios
	public fakeNames = ['Juan', 'Pedro', 'Maria', 'Ana', 'Carlos', 'Luis', 'Jose', 'Sofia', 'Jorge', 'Clara'];
	public fakePositions = ['Delantero', 'Defensor', 'Centrocampista', 'Portero'];
	public fakeNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];


	public showEditModal: boolean = false;

	public selectedStudentActivity: StudentActivity | null = null;
	public showSubmenu: { [key: string]: boolean } = {};
	public showModal: boolean = false;
	public mode: 'add' | 'update' = 'add';


	activeTab: 'existing' | 'new' = 'existing';
	searchTerm = '';
	students: Student[] = []; // Lista completa de estudiantes
	filteredStudents: Student[] = []; // Lista filtrada para búsqueda
	selectedExistingStudent: Student | null = null;
	newStudent: { name: string; birthdate: string } = { name: '', birthdate: '' };
	maxBirthdate = new Date();


	public categories: Category[] = [];
	selectedCategory: Category | null = null;
	newCategoryId: number | null = null;
	selectedCategoryId: number | null = null;

	public newActivities: Activity[] = [];

	public activities: Activity[] = [];
	selectedActivity: Activity | null = null;
	newActivityId: number | null = null;
	selectedActivityId: number | null = null;

	public studentActivities: StudentActivity[] = [];
	// selectedActivityId: number | null = null;


	private buildQueryString(params: any): string {
		const queryParams = new URLSearchParams();

		// Convertir arrays a formato de query string
		Object.keys(params).forEach(key => {
			if (Array.isArray(params[key])) {
				params[key].forEach((item: any, index: number) => {
					if (typeof item === 'object') {
						Object.keys(item).forEach(subKey => {
							queryParams.append(`${key}[${index}].${subKey}`, item[subKey]);
						});
					} else {
						queryParams.append(`${key}[${index}]`, item);
					}
				});
			} else {
				queryParams.append(key, params[key]);
			}
		});

		return queryParams.toString();
	}

	onNewCategoryChange() {

		const queryString = RequestQueryBuilder.create({
			fields: ['id', 'description', 'gracePeriod', 'categoryId', 'typeId'],
			search: { categoryId: Number(this.newCategoryId!) },
			// search: {
			//   'category.id': Number(this.selectedCategoryId)  // Filtra por el ID de la relación
			// },
			join: [
				{ field: 'category', select: ['id', 'name'] },  // Ajusta los campos según tu modelo
				// { field: 'type', select: ['id', 'name'] }
			],
			// sort: [{ field: 'id', order: 'DESC' }],
			page: 1,
			limit: 5,
		}).query();


		const activities = new BaseHttp(`activities?${queryString}`, this.http);
		activities.get<ApiRes<Activity>>().subscribe(result => {
			this.newActivities = result.data;

			if (this.newActivities.length) {
				this.newActivityId = this.newActivities[0].id;
				// this.onActivityChange(this.activities[0].id, 0);
			}

		});
	}

	onCategoryChange() {
		const queryString = RequestQueryBuilder.create({
			fields: ['id', 'description', 'gracePeriod', 'categoryId', 'typeId'],
			search: { categoryId: Number(this.selectedCategoryId!) },
			// search: {
			//   'category.id': Number(this.selectedCategoryId)  // Filtra por el ID de la relación
			// },
			join: [
				{ field: 'category', select: ['id', 'name'] },  // Ajusta los campos según tu modelo
				// { field: 'type', select: ['id', 'name'] }
			],
			// sort: [{ field: 'id', order: 'DESC' }],
			page: 1,
			limit: 5,
		}).query();

		this.newActivity.categoryId = this.selectedCategoryId!;

		const activities = new BaseHttp(`activities?${queryString}`, this.http);
		activities.get<ApiRes<Activity>>().subscribe(result => {
			this.activities = result.data;
			this.newActivities = [...this.activities];

			if (this.activities.length) {
				this.onActivityChange(this.activities[0].id, 0);
			}

		});

	}


	// Método para seleccionar una actividad
	onActivityChange(activityId: number, index: number): void {

		this.selectedActivity = this.activities.find(activity => activity.id === activityId) ?? null;
		this.selectedActivityId = activityId;
		this.selectedStudentActivity = null;


		// Encuentra el botón seleccionado
		setTimeout(() => {
			const buttons = document.querySelectorAll('button');
			const selectedButton = buttons[index] as HTMLElement;

			if (selectedButton) {
				this.highlightWidth = selectedButton.offsetWidth + 12; // Ajuste del tamaño
				this.highlightPosition = selectedButton.offsetLeft - 6; // Ajuste de posición
			}
		}, 50);


		const queryString = RequestQueryBuilder.create({
			// fields: ['id', 'description', 'gracePeriod', 'categoryId', 'typeId'],
			search: { activityId: Number(this.selectedActivityId!) },

			// limit: 5,
		}).query();

		const studentActivities = new BaseHttp(`student-activities?${queryString}`, this.http);
		studentActivities.get<StudentActivity[]>().subscribe(result => {

			this.studentActivities = result;

			// this.activities = result.data;

			// if (this.activities.length) {
			// 	this.onActivityChange(this.activities[0].id, 0);
			// }
		});

	}

	private serializeFilterOptions(options: any): any {
		return {
			filter: JSON.stringify(options)
		};
	}

	constructor(
		// private studentService: StudentService, // Asume que tienes un servicio para estudiantes
		private http: HttpClient) {

		const categories = new BaseHttp(`categories`, this.http);
		categories.get<Category[]>().subscribe(result => {
			console.log(result);
			this.categories = result;

			if (this.categories.length > 0) {
				this.selectedCategoryId = this.categories[0].id;
				this.selectedCategory = this.categories[0]!;
				this.onCategoryChange();

				this.newActivity.categoryId = this.selectedCategoryId;
			}
		});


	}



	addNewAvatar() {
		this.mode = 'add';
		this.selectedStudentActivity = new StudentActivity();

		this.showModal = true;
		// Aquí puedes abrir un modal o formulario para agregar un nuevo avatar.

		this.newActivityId = this.selectedActivityId;
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
		this.mode = 'update';

		this.selectedStudentActivity = { ...studentActivity }; // Clonamos para no modificar directamente
		this.showEditModal = true;
	}

	// Método para cerrar el modal
	closeModal(): void {
		this.showModal = false;
	}

	closeUpdateModal(): void {
		this.showEditModal = false;
	}

	// Método para guardar los cambios
	saveUpdateChanges(): void {

		const student = {
			name: this.selectedStudentActivity!.student.name
		};

		const studentsAPI = new BaseHttp(`students/${this.selectedStudentActivity!.student.id}`, this.http);
		// delete (student as any).id;
		studentsAPI.patch(student).subscribe(result => {

			this.showEditModal = false;
			// this.studentActivities = result;

			// this.activities = result.data;

			// if (this.activities.length) {
			// 	this.onActivityChange(this.activities[0].id, 0);
			// }
		});

	}

	saveChanges(): void {



		if (this.activeTab === 'existing' && this.selectedExistingStudent) {
			// Lógica para agregar estudiante existente a la actividad
			this.addStudentToActivity(this.selectedExistingStudent);
		} else if (this.activeTab === 'new' && this.newStudent.name) {
			// Lógica para crear nuevo estudiante y agregarlo a la actividad
			this.createNewStudent();
		}

		this.closeModal();


		// console.log(this.selectedStudentActivity);

		// const student = { ...this.selectedStudentActivity!.student };

		// const studentsAPI = new BaseHttp(`students/${student.id}`, this.http);
		// // delete (student as any).id;
		// studentsAPI.patch(student).subscribe(result => {

		// 	// this.studentActivities = result;

		// 	// this.activities = result.data;

		// 	// if (this.activities.length) {
		// 	// 	this.onActivityChange(this.activities[0].id, 0);
		// 	// }
		// });

		// const activity = this.activities.find(a => a.id === this.selectedActivityId);
		// if (activity) {
		//   const index = activity.avatars.findIndex(a => a.id === this.selectedAvatar.id);
		//   if (index !== -1) {
		//     activity.avatars[index] = { ...this.selectedAvatar }; // Guardamos los cambios
		//   }
		// }
		// this.showModal = false;
	}

	highlightWidth = 0;
	highlightPosition = 0;

	public showPaymentModal: boolean = false;

	// Método para abrir el modal de pago
	openPaymentModal(): void {
		this.showPaymentModal = true;
	}

	ngOnInit() {
		this.loadStudents();
	}

	loadStudents(): void {
		const studentsAPI = new BaseHttp('students', this.http);
		studentsAPI.get<Student[]>().subscribe({
			next: (students) => {
				this.students = students;
				this.filteredStudents = [...students];
			},
			error: (err) => console.error('Error loading students', err)
		});
	}

	filterStudents(): void {
		if (!this.searchTerm) {
			this.filteredStudents = [...this.students];
			return;
		}

		const term = this.searchTerm.toLowerCase();
		this.filteredStudents = this.students.filter(student =>
			student.name.toLowerCase().includes(term)
		);
	}

	selectStudent(student: Student): void {
		this.selectedExistingStudent = student;
	}

	openModal(): void {
		this.showModal = true;
		this.activeTab = 'existing';
		this.searchTerm = '';
		this.selectedExistingStudent = null;
		this.newStudent = { name: '', birthdate: '' };
		this.filterStudents();
	}




	addStudentToActivity(student: Student): void {
		// Implementa la lógica para agregar el estudiante a la actividad
		console.log('Estudiante seleccionado:', student);
		// Aquí llamarías a tu servicio para agregar el estudiante a la actividad

		const body = {
			studentId: student.id,
			activityId: this.selectedActivityId // Asume que tienes this.activityId disponible
		};

		new BaseHttp('student-activities', this.http)
			.post<typeof body, StudentActivity>(body)
			.subscribe({
				next: (studentActivity) => {
					console.log('Estudiante agregado a actividad:', studentActivity);
					// Aquí puedes actualizar tu UI o lista de estudiantes en la actividad
					this.closeModal();
					this.loadStudents();

					this.onActivityChange(this.selectedCategoryId!, 0);
					// Si necesitas recargar la lista
				},
				error: (err) => {
					console.error('Error al agregar estudiante a actividad', err);
					// Puedes mostrar un mensaje de error al usuario si lo deseas
				}
			});

	}

	createNewStudent(): void {
		const birthdate = this.newStudent.birthdate ? new Date(this.newStudent.birthdate) : new Date();

		const newStudentData = {
			name: this.newStudent.name,
			birthdate: birthdate
		};

		// this.studentService.createStudent(newStudentData).subscribe({
		// 	next: (createdStudent) => {
		// 		this.addStudentToActivity(createdStudent);
		// 	},
		// 	error: (err) => console.error('Error creating student', err)
		// });

		const studentsAPI = new BaseHttp('students', this.http);
		studentsAPI.post<typeof newStudentData, Student>(newStudentData).subscribe({
			next: (createdStudent) => {
				this.addStudentToActivity(createdStudent);
			},
			error: (err) => console.error('Error creating student', err)
		})
	}

	getFormattedDate(date: Date): string {
		if (!date) return '';
		const d = new Date(date);
		const year = d.getFullYear();
		const month = ('0' + (d.getMonth() + 1)).slice(-2);
		const day = ('0' + d.getDate()).slice(-2);
		return `${year}-${month}-${day}`;
	}

	getAge(birthdate: Date): number {
		const today = new Date();
		const birthDate = new Date(birthdate);
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();

		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}

		return age;
	}






	closePaymentModal() {
		this.showPaymentModal = false;
	}


	activityTypes: ActivityType[] = [];


	newActivity: CreateActivityDto = {
		description: '',
		startDate: new Date(),
		endDate: new Date(),
		gracePeriod: 0,
		price: 0,
		categoryId: this.selectedCategoryId!,
		typeId: 0
	};

	public newEventModalVisible: boolean = false;
	public newEventName: string = '';
	public newEventStartDate: string = '';
	public newEventEndDate: string = '';
	public newEventCost: number | null = null;

	// Función para abrir el modal de nuevo evento
	openNewEventModal(): void {
		this.newEventModalVisible = true;


		const activityTypesAPI = new BaseHttp('activity-types', this.http);
		activityTypesAPI.get<ActivityType[]>().subscribe(result => {
			this.activityTypes = result;

		});
	}


	// Función para cerrar el modal de nuevo evento
	closeNewEventModal(): void {
		this.newEventModalVisible = false;
	}

	// Función para guardar el nuevo evento
	saveNewActivity(): void {
		if (this.validateActivity()) {


			const activityToSend = {
				...this.newActivity,
				categoryId: Number(this.newActivity.categoryId),
				typeId: Number(this.newActivity.typeId)
			};


			const activitiesAPI = new BaseHttp('activities', this.http);
			activitiesAPI.post<CreateActivityDto, Activity>(activityToSend).subscribe({
				next: (activity) => {
					// Aquí puedes manejar la respuesta, por ejemplo:
					// this.activities.push(activity);
					this.closeNewEventModal();
					// Mostrar mensaje de éxito
				},
				error: (err) => {
					console.error('Error al crear la actividad:', err);
					// Mostrar mensaje de error
				}
			});
		} else {
			alert('Por favor, complete todos los campos correctamente.');
		}
	}

	validateActivity(): boolean {
		return !!this.newActivity.description &&
			!!this.newActivity.startDate &&
			!!this.newActivity.endDate &&
			this.newActivity.price > 0 &&
			this.newActivity.categoryId > 0 &&
			this.newActivity.typeId > 0;
	}

}
