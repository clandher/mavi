import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BaseHttp } from '@app/core/base-http';
import { Student, UpdateStudentDto } from '@app/core/dto';
import { FormGroupComponent } from '../form-group/form-group.component';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { setFocus } from '@app/core/helpers';
import { ImageHttpClient } from '@app/core/image-http-client';
import { ModalService } from '@app/core/modal.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { SubmitComponent } from "../submit/submit.component";
import { NotificationConfigurationComponent } from '../configuration/notification-configuration.component';

@Component({
	standalone: true,
	imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, FormGroupComponent, SubmitComponent],
	templateUrl: './student-info.component.html',
})
export class StudentInfoComponent {
	public tutors: { id: number; name: string }[] = [];

	public form: FormGroup;

	public student: Student | null = null;
	private studentId: number = 0;

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
			wantsNotifications: [false],
			tutorId: [''],
		});

		// Actualiza validadores de teléfono cuando wantsNotifications cambie
		this.form.get('wantsNotifications')?.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe((wants: boolean) => {
				const phoneControl = this.form.get('phone');
				if (wants) {
					phoneControl?.setValidators([control => control.value ? null : { required: true }]);
				} else {
					phoneControl?.clearValidators();
				}
				phoneControl?.updateValueAndValidity();
			});

		this.studentId = Number(this.route.parent!.snapshot.paramMap.get('id'));
		this._loadStudent();
		this._loadTutors();

	}


	private _loadTutors(): void {
		const tutorsAPI = new BaseHttp('tutors', this.http);
		tutorsAPI.get<{ id: number; name: string }[]>().subscribe({
			next: (tutors) => {
				this.tutors = tutors;
			},
			error: (err) => {
				console.error('Error loading tutors', err);
			}
		});
	}
	private _loadStudent(): void {
		const studentsAPI = new BaseHttp(`students/${this.studentId}`, this.http);
		studentsAPI.get<Student>().subscribe({
			next: (student) => {
				this.student = student;
				this.form.patchValue({
					birthdate: new Date(student.birthdate).toISOString().slice(0, 10),
					curp: student.curp,
					phone: student.phone,
					placeOfBirth: student.placeOfBirth,
					nick: student.nick,
					wantsNotifications: student.wantsNotifications ?? false,
					tutorId: student.tutorId 
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
		const studentsAPI = new BaseHttp(`students`, this.http);
		if (this.form.value.wantsNotifications && !this.form.value.phone) {
			this.form.get('phone')?.setErrors({ required: true });
			this.toastr.error('El teléfono es requerido para recibir notificaciones.');
			return;
		}
		const updateStudentDto: UpdateStudentDto = {
			name: this.form.value.name,
			birthdate: new Date(this.form.value.birthdate),
			curp: this.form.value.curp,
			phone: this.form.value.phone,
			placeOfBirth: this.form.value.placeOfBirth,
			nick: this.form.value.nick,
			wantsNotifications: this.form.value.wantsNotifications,
			tutorId: this.form.value.tutorId,
		};

		await studentsAPI.patch(this.studentId, updateStudentDto).toPromise();
	}

	showConfigurations(): void {
		this.modalService.open({
			component: NotificationConfigurationComponent,
			inputs: { studentId: this.studentId },
			title: 'Configurar notificaciones',
			size: 'md'
		}).pipe(takeUntil(this.destroy$)).subscribe(() => {
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
