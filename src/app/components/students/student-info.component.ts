import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BaseHttp } from '@app/core/base-http';
import { Category, Student, StudentCategory, UpdateStudentDto } from '@app/core/dto';
import { RequestQueryBuilder } from '@dataui/crud-request';
import { FormGroupComponent } from '../form-group/form-group.component';
import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { setFocus } from '@app/core/helpers';
import { ImageHttpClient } from '@app/core/image-http-client';
import { ModalService } from '@app/core/modal.service';
import { StudentService } from '@app/core/student.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { SubmitComponent } from "../submit/submit.component";


@Component({
	standalone: true,
	imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, FormGroupComponent, SubmitComponent],
	templateUrl: './student-info.component.html',
})
export class StudentInfoComponent {
	public form: FormGroup;

	private destroy$ = new Subject<void>();

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private http: HttpClient,
		private imageHttp: ImageHttpClient,
		private fb: FormBuilder,
		private toastr: ToastrService,
		private modalService: ModalService,
	) {
		this.form = this.fb.group({
			birthdate: [''],
			curp: [''],
			phone: [''],
			placeOfBirth: [''],
			nick: [''],

		});
	}

	private _loadStudent(studentId: number): void {
		const studentsAPI = new BaseHttp(`students/${studentId}`, this.http);
		studentsAPI.get<Student>().subscribe({
			next: (student) => {
				this.form.patchValue({
					birthdate: new Date(student.birthdate).toISOString().slice(0, 10),
					curp: student.curp,
					phone: student.phone,
					placeOfBirth: student.placeOfBirth,
					nick: student.nick,

				});

				if (!student.curp) {
					this.form.patchValue({ curp: 'AAAA000000AAAAAAAA' });
				}

				setFocus('name', false);
			},
			error: (err) => {
				console.error('Error loading student', err);
				this.router.navigate(['/app/estudiantes']);
			}
		});
	}

	public async submit(): Promise<void> {
		const studentId = this.route.snapshot.paramMap.get('id') ?? 0;
		const studentsAPI = new BaseHttp(`students`, this.http);
		const updateStudentDto: UpdateStudentDto = {
			name: this.form.value.name,
			birthdate: new Date(this.form.value.birthdate),
			curp: this.form.value.curp,
			phone: this.form.value.phone,
			placeOfBirth: this.form.value.placeOfBirth,
			nick: this.form.value.nick
		};

		await studentsAPI.patch(studentId, updateStudentDto).toPromise();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
