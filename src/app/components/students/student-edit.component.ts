import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BaseHttp, buildUrl } from '@app/core/base-http';
import { CreateStudentDto, Student, UpdateStudentDto } from '@app/core/dto';
import { uploadStudentPhoto } from '@app/core/helpers';

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './student-edit.component.html',
    styleUrls: ['./student-edit.component.scss']
})
export class StudentEditComponent {

    isSaving = false;
    private pendingPhotoFile: File | null = null;

    student: Student = {
        id: 0,
        name: '',
        birthdate: '',
        nick: '',
        debt: 0,
        categories: [],
        activities: [],
        payments: [],
        photo: '',
        photoUrl: '',
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient
    ) {
    }


    ngAfterViewInit(): void {
        const studentId = this.route.snapshot.paramMap.get('id');

        if (!studentId) {
            this.student.id = 0;
            this.student.birthdate = new Date().toISOString().slice(0, 10);
        } else {
            this._loadStudent(+studentId!);
        }
    }

    public saveStudent(): void {
        this.isSaving = true;

        if (this.student.id === 0) {
            this._createStudent();
        } else {
            this._updateStudent();
        }
    }

    private _updateStudent(): void {
        const studentsAPI = new BaseHttp(`students/${this.student.id}`, this.http);
        const updateStudentDto: UpdateStudentDto = {
            name: this.student.name,
            birthdate: new Date(this.student.birthdate),
        };

        studentsAPI.patch(updateStudentDto).subscribe({
            next: () => {
                this.isSaving = false;
            },
            error: (err) => {
                console.error('Error saving student', err);
                this.isSaving = false;
            }
        });
    }

    private _createStudent(): void {
        const studentsAPI = new BaseHttp('students', this.http);
        const createStudentDto: CreateStudentDto = {
            name: this.student.name,
            birthdate: new Date(this.student.birthdate),
        };

        studentsAPI.post<CreateStudentDto, Student>(createStudentDto).subscribe({
            next: (student) => {
                this.student = student;
                this._uploadPendingPhotoIfAny();
                this.isSaving = false;
                this.router.navigate(['/app/estudiantes', student.id, 'editar']);
            },
            error: (err) => {
                console.error('Error creating student', err);
                this.isSaving = false;
            }
        });
    }

    private _loadStudent(studentId: number): void {

        const studentsAPI = new BaseHttp(`students/${studentId}`, this.http);
        studentsAPI.get<Student>().subscribe({
            next: (student) => {
                student.birthdate = new Date(student.birthdate).toISOString().slice(0, 10);

                if (student.photo) {
                    student.photoUrl = buildUrl(`students/${studentId}/photo`);
                }

                this.student = student;
            }, error: (err) => {
                console.error('Error loading student', err);
                this.router.navigate(['/app/estudiantes']);
            }
        });
    }

    onPhotoSelected(event: Event) {

        if (this.student.id > 0) {
            uploadStudentPhoto(event, this.student, this.http);
            return;
        }

        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];

            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result as string;
                this.student.photo = base64;
                this.student.photoUrl = base64;
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
        uploadStudentPhoto(event, this.student, this.http);
        this.pendingPhotoFile = null;
    }
}