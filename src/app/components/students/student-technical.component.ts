import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseHttp, buildUrl } from '@app/core/base-http';
import { StudentObservation } from '@app/core/dto';
import { RequestQueryBuilder } from '@dataui/crud-request';
import { SubmitComponent } from '../submit/submit.component';
import { MaviValidators } from '@app/core/mavi-validators';
import { FormGroupComponent } from '../form-group/form-group.component';

@Component({
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, SubmitComponent, FormGroupComponent],
	templateUrl: './student-technical.component.html',
	providers: []
})

export class StudentTechnicalComponent {

	studentId: number | null = null;
	technicalForm: FormGroup;
	showObservations: any;

	constructor(
		private http: HttpClient,
		private route: ActivatedRoute,
		private fb: FormBuilder
	) {
		this.studentId = Number(this.route.parent!.snapshot.paramMap.get('id'));

		this.technicalForm = this.fb.group({
			foot: [''],
			position: [''],
			height: [''],
			weight: [''],
			number: [''],
			observations: [''],
			strengths: [''],
			weaknesses: ['']
		});
		this.getStudent();
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
}
