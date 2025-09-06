// student-edit.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BaseHttp, buildUrl } from '@app/core/base-http';
import { CreateStudentDto, Student, UpdateStudentDto } from '@app/core/dto';

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './student-edit.component.html',
    styleUrls: ['./student-edit.component.scss']
})
export class StudentEditComponent {

    isSaving = false;

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
        active: true,
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
            this.loadStudent(+studentId!);
        }

    }

    saveStudent(): void {
        this.isSaving = true;

        if (this.student.id === 0) {
            this.createStudent();
        } else {
            this.updateStudent();
        }
    }

    private updateStudent(): void {
        const studentsAPI = new BaseHttp(`students/${this.student.id}`, this.http);
        const updateStudentDto: UpdateStudentDto = {
            name: this.student.name,
            birthdate: new Date(this.student.birthdate),
            active: this.student.active // <-- agrega esto
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

    private createStudent(): void {
        const studentsAPI = new BaseHttp('students', this.http);
        const createStudentDto: CreateStudentDto = {
            name: this.student.name,
            birthdate: new Date(this.student.birthdate),
            active: this.student.active // <-- agrega esto
        };

        studentsAPI.post<CreateStudentDto, Student>(createStudentDto).subscribe({
            next: (student) => {
                this.student = student;
                this.isSaving = false;
                this.router.navigate(['/app/estudiantes', student.id, 'editar']);
            },
            error: (err) => {
                console.error('Error creating student', err);
                this.isSaving = false;
            }
        });
    }

    loadStudent(id: number): void {

        const studentsAPI = new BaseHttp(`students/${id}`, this.http);
        studentsAPI.get<Student>().subscribe({
            next: (student) => {
                student.birthdate = new Date(student.birthdate).toISOString().slice(0, 10);
                
                if (student.photo){
                    student.photoUrl = buildUrl(`students/${id}/photo`);
                }
                
                this.student = student;
            },
            error: (err) => {
                console.error('Error loading student', err);
                this.router.navigate(['/app/estudiantes']);
            }
        });
    }

    uploadPhoto(file: File): void {
        if (!file || !this.student.id) return;

        const formData = new FormData();
        formData.append('file', file);

        const studentsAPI = new BaseHttp(`students/${this.student.id}/upload`, this.http);
        studentsAPI.post<FormData, any>(formData).subscribe({
            next: (res) => {
                const timestamp = new Date().getTime();

                this.student.photoUrl = buildUrl(`students/${this.student.id}/photo`) + `?t=${timestamp}`;
            },
            error: (err) => {
                console.error('Error uploading photo', err);
            }
        });
    }

    onPhotoSelected(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            this.uploadPhoto(file);
            // Si quieres mostrar preview local:
            const reader = new FileReader();
            reader.onload = () => {
                this.student.photo = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }
}