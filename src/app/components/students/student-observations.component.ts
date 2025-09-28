import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BaseHttp, buildUrl } from '@app/core/base-http';
import { StudentObservation } from '@app/core/dto';
import { RequestQueryBuilder } from '@dataui/crud-request';
import { SubmitComponent } from "../submit/submit.component";
import { ObservationsComponent } from '../observations';

@Component({
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule, SubmitComponent, ObservationsComponent],
	templateUrl: './student-observations.component.html',
	providers: []
})

export class StudentObservationsComponent implements OnInit {

	studentId: number | null = null;
	technicalForm: FormGroup;
	selectedTab: 'observations' | 'timeObservations' = 'observations';
	studentObservationsAPI: BaseHttp;
	timeObservations: StudentObservation[] = [];
	showObservations: any;

	constructor(
		private http: HttpClient,
		private route: ActivatedRoute,
		private fb: FormBuilder
	) {
		this.studentId = Number(this.route.parent!.snapshot.paramMap.get('id'));
		const queryString = RequestQueryBuilder.create({
			search: { studentId: this.studentId },
		}).query();


		this.studentObservationsAPI = new BaseHttp(`student-observations?${queryString}`, this.http);
		this.technicalForm = this.fb.group({
			foot: ['', Validators.required],
			position: ['', Validators.required],
			height: [null, [Validators.required, Validators.min(100), Validators.max(250)]],
			weight: [null, [Validators.required, Validators.min(30), Validators.max(150)]],
			number: [null, [Validators.required, Validators.min(1), Validators.max(99)]],
			observations: [''],
			strengths: [''],
			weaknesses: ['']
		});
		this.getStudent();
	}

	ngOnInit() {
		this.studentObservationsAPI.get<StudentObservation[]>().subscribe((data: StudentObservation[]) => {
			this.timeObservations = data;
		});
	}

	getStudent() {
		if (!this.studentId) return;
		this.http.get<any>(buildUrl(`students/${this.studentId}`)).subscribe({
			next: (student) => {
				if (student.technical) {
					this.technicalForm.patchValue(student.technical);
				}
			},
			error: (err) => {
				console.error('Error al obtener datos del estudiante', err);
			}
		});
	}

	onSubmit(): Promise<any> {
		if (!this.studentId) return Promise.resolve();
		const body = { technical: { ...this.technicalForm.value } };
		return this.http.patch(buildUrl(`students/${this.studentId}`), body).toPromise();
	}

	saveObservation(obs: StudentObservation) {
		this.http.patch(buildUrl(`student-observations/${obs.id}`), { observation: obs.observation }).subscribe({
			next: () => {
				// Puedes mostrar un mensaje de éxito
			},
			error: (err) => {
				// Manejo de errores
			}
		});
	}

	deleteObservation(obs: StudentObservation) {
		this.http.delete(buildUrl(`student-observations/${obs.id}`)).subscribe({
			next: () => {
				this.timeObservations = this.timeObservations.filter(o => o.id !== obs.id);
			},
			error: (err) => {
				console.error('Error al eliminar observación', err);
			}
		});
	}

	onObservationsComplete($event: boolean) {
		if ($event) {
			this.studentObservationsAPI.get<StudentObservation[]>().subscribe((data: StudentObservation[]) => {
				this.timeObservations = data;
			});
		}
		this.showObservations = false;
	}
}

