import { Component, EventEmitter, Input, OnInit, Output, output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp, buildUrl } from '@app/core/base-http';
import { Activity, ActivityType, Category, CreateActivityDto, Student, StudentActivity } from '@app/core/dto';
import { formatDateForDisplay } from '@app/core/helpers';
import { RequestQueryBuilder } from '@dataui/crud-request';

@Component({
    selector: 'app-inscription',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './inscription.component.html',
    styleUrls: ['./inscription.component.scss']
})
export class InscriptionComponent implements OnInit {
    isStudentSelected(student: Student): boolean {
        return this.selectedExistingStudents.some(s => s.id === student.id);
    }

    hasActivityAssigned(student: Student): boolean {
        if (!student.activities || !Array.isArray(student.activities)) return false;
        return student.activities.some(act => act.activity && act.activity.id === Number(this.newActivityId));
    }

    onCancel() {
        this.activeTab = 'existing';
        this.selectedExistingStudents = [];
        this.newStudent = { name: '', birthdate: '' };
        this.complete.emit(false);
    }

    @Output() complete = new EventEmitter<boolean>();

    categories: Category[] = [];
    activities: Activity[] = [];
    activityTypes: ActivityType[] = [];
    maxBirthdate: string = '';
    students: Student[] = [];
    filteredStudents: Student[] = [];
    selectedExistingStudents: Student[] = [];
    newStudent: { name: string; birthdate: string } = { name: '', birthdate: '' };
    activeTab: 'existing' | 'new' = 'existing';
    searchTerm: string = '';
    newCategoryId: number | null = null;
    newActivityId: number | null = null;

    showPaymentModal: boolean = false;
    selectedStudentActivity: StudentActivity | null = null;

    constructor(private http: HttpClient, private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit() {
        this.loadCategories();
        this.loadStudents();
        this.maxBirthdate = formatDateForDisplay(new Date());
    }

    loadCategories() {
        const categories = new BaseHttp(`categories`, this.http);
        categories.get<Category[]>().subscribe(result => {
            this.categories = result;
            if (this.categories.length > 0) {
                this.newCategoryId = this.categories[0].id;
                this.onNewCategoryChange();
            }
        });
    }

    onNewCategoryChange() {

        const queryString = RequestQueryBuilder.create({
            search: { categoryId: Number(this.newCategoryId) },
        }).query();

        // const queryString = `categoryId=${this.newCategoryId}`;
        const activities = new BaseHttp(`activities?${queryString}`, this.http);
        activities.get<Activity[]>().subscribe(result => {
            this.activities = result;
            if (this.activities.length) {
                this.newActivityId = this.activities[0].id;
            }
        });
    }

    onNewActivityChange() {
        // Si tienes lógica para filtrar o actualizar, ponla aquí.
        // Si no, puedes forzar la detección de cambios:
        this.filterStudents(); // si existe
        // O usa ChangeDetectorRef si es necesario
        this.changeDetectorRef.detectChanges();
    }

    loadStudents() {
        const studentsAPI = new BaseHttp('students', this.http);
        studentsAPI.get<Student[]>().subscribe(students => {
            this.students = students;
            this.filteredStudents = students.map(student => {
                if (student.photo) {
                    student.photoUrl = buildUrl(`students/${student.id}/photo`);
                }

                student.categories = student.categories.map(studentCategory => {
                    studentCategory.category = this.categories.find(c => c.id === studentCategory.categoryId) || { id: 0, type: 'as', students: [], activities: [] };
                    return studentCategory;
                });

                return student;
            });
        });
    }

    filterStudents() {

        const term = this.searchTerm.toLowerCase();
        this.filteredStudents = this.students.filter(student =>
            student.name.toLowerCase().includes(term)
        );
    }


    selectStudent(student: Student) {
        const idx = this.selectedExistingStudents.findIndex(s => s.id === student.id);
        if (idx > -1) {
            this.selectedExistingStudents.splice(idx, 1);
        } else {
            this.selectedExistingStudents.push(student);
        }
    }

    async onInscription() {
        if (this.activeTab === 'existing' && this.selectedExistingStudents.length > 0) {
            const promises = this.selectedExistingStudents.map(async student => {
                const hasCategory = student.categories.some(sc => sc.categoryId === Number(this.newCategoryId));
                if (!hasCategory) {
                    const studentCategoriesAPI = new BaseHttp(`student-categories`, this.http);
                    await studentCategoriesAPI.post({ studentId: student.id, categoryId: Number(this.newCategoryId) }).toPromise();
                }
                await this.addStudentToActivityAsync(student);
            });

            await Promise.all(promises);

            this.complete.emit(true);
            this.selectedExistingStudents = [];
        } else if (this.activeTab === 'new' && this.newStudent.name) {
            this.createNewStudent();
        }
    }

    private async addStudentToActivityAsync(student: Student) {
        const body = {
            studentId: student.id,
            activityId: Number(this.newActivityId),
        };
        await new BaseHttp('student-activities', this.http)
            .post<typeof body, StudentActivity>(body)
            .toPromise();
        this.newStudent = { name: '', birthdate: '' };
    }

    addStudentToActivity(student: Student) {
        const body = {
            studentId: student.id,
            activityId: Number(this.newActivityId),
        };
        new BaseHttp('student-activities', this.http)
            .post<typeof body, StudentActivity>(body)
            .subscribe(() => {
                // No limpiar selectedExistingStudents aquí, se hace en onInscription
                this.newStudent = { name: '', birthdate: '' };
            });
    }

    createNewStudent() {
        const birthdate = this.newStudent.birthdate ? new Date(this.newStudent.birthdate) : new Date();
        const newStudentData = {
            name: this.newStudent.name,
            birthdate: birthdate
        };
        const studentsAPI = new BaseHttp('students', this.http);
        studentsAPI.post<typeof newStudentData, Student>(newStudentData).subscribe(createdStudent => {
            const studentCategoriesAPI = new BaseHttp(`student-categories`, this.http)
            studentCategoriesAPI.post({ studentId: createdStudent.id, categoryId: Number(this.newCategoryId) }).subscribe(() => {
                this.addStudentToActivity(createdStudent);

                this.complete.emit(true);
            });
        });
    }


}
