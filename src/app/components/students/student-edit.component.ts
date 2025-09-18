import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BaseHttp, buildUrl } from '@app/core/base-http';
import { CreateStudentDto, Student, UpdateStudentDto } from '@app/core/dto';
import { uploadStudentPhoto } from '@app/core/helpers';
import { FormGroupComponent } from '../form-group/form-group.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SubmitComponent } from '../submit/submit.component';

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, FormGroupComponent, ReactiveFormsModule, SubmitComponent],
    templateUrl: './student-edit.component.html',
    styleUrls: ['./student-edit.component.scss']
})
export class StudentEditComponent {

    private pendingPhotoFile: File | null = null;

    studentForm: FormGroup;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
        private fb: FormBuilder
    ) {
        this.studentForm = this.fb.group({
            id: [0],
            name: [''],
            birthdate: [''],
            nick: [''],
            photo: [''],
            photoUrl: [''],
            curp: [''],
            phone: [''],
            placeOfBirth: ['']
        });
    }

    ngAfterViewInit(): void {
        const studentId = this.route.snapshot.paramMap.get('id');

        if (!studentId) {
            this.studentForm.patchValue({
                id: 0,
                birthdate: new Date().toISOString().slice(0, 10)
            });
        } else {
            this._loadStudent(+studentId!);
        }
    }

    public async saveStudent(): Promise<void> {
        if (this.studentForm.value.id === 0) {
            await this._createStudent();
        } else {
            await this._updateStudent();
        }
    }

    private async _updateStudent(): Promise<void> {
        const studentsAPI = new BaseHttp(`students/${this.studentForm.value.id}`, this.http);
        const updateStudentDto: UpdateStudentDto = {
            name: this.studentForm.value.name,
            birthdate: new Date(this.studentForm.value.birthdate),
        };

        await studentsAPI.patch(updateStudentDto).toPromise();
    }

    private async _createStudent(): Promise<void> {
        const studentsAPI = new BaseHttp('students', this.http);
        const createStudentDto: CreateStudentDto = {
            name: this.studentForm.value.name,
            birthdate: new Date(this.studentForm.value.birthdate),
        };

        const student = await studentsAPI.post<CreateStudentDto, Student>(createStudentDto).toPromise();

        if (!student) {
            throw new Error('No se pudo crear el estudiante.');
        }

        this.studentForm.patchValue({
            id: student.id,
            photo: student.photo,
            photoUrl: student.photoUrl
        });
        this._uploadPendingPhotoIfAny();
        this.router.navigate(['/app/estudiantes', student.id, 'editar']);
    }

    private _loadStudent(studentId: number): void {
        const studentsAPI = new BaseHttp(`students/${studentId}`, this.http);
        studentsAPI.get<Student>().subscribe({
            next: (student) => {
                this.studentForm.patchValue({
                    id: student.id,
                    name: student.name,
                    birthdate: new Date(student.birthdate).toISOString().slice(0, 10),
                    photo: student.photo,
                    photoUrl: buildUrl(`students/${studentId}/photo`)
                });
            },
            error: (err) => {
                console.error('Error loading student', err);
                this.router.navigate(['/app/estudiantes']);
            }
        });
    }

    onPhotoSelected(event: Event) {
        if (this.studentForm.value.id > 0) {
            uploadStudentPhoto(event, this.studentForm.value, this.http);
            return;
        }

        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];

            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result as string;
                this.studentForm.patchValue({
                    photo: base64,
                    photoUrl: base64
                });
            };
            reader.readAsDataURL(file);
            this.pendingPhotoFile = file;
        }
    }

    private _uploadPendingPhotoIfAny() {
        if (!this.pendingPhotoFile) {
            return;
        }

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(this.pendingPhotoFile);
        const fakeInput = document.createElement('input');
        fakeInput.type = 'file';
        fakeInput.files = dataTransfer.files;
        const event = { target: fakeInput } as unknown as Event;
        uploadStudentPhoto(event, this.studentForm.value, this.http);
        this.pendingPhotoFile = null;
    }

    closeModal(): void {
        // Implementar lógica para cerrar el modal o realizar acciones al descartar
        console.log('Modal cerrado');
    }
}