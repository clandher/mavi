// student-edit.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
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
        birthdate: new Date(),
        debt: 0,
        categories: [],
        activities: [],
        payments: [],
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
            birthdate: this.student.birthdate,
        };

        studentsAPI.patch(updateStudentDto).subscribe({
            next: () => {
                this.isSaving = false;
                this.router.navigate(['/app/students']);
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
            birthdate: this.student.birthdate
        };

        studentsAPI.post<CreateStudentDto, Student>(createStudentDto).subscribe({
            next: (student) => {
                this.student = student;
                this.isSaving = false;
                this.router.navigate(['/app/students', student.id, 'edit']);
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
                student.birthdate = new Date(student.birthdate);
                this.student = student;
            },
            error: (err) => {
                console.error('Error loading student', err);
                this.router.navigate(['/app/students']);
            }
        });
    }
}