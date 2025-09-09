import { Component, EventEmitter, Input, OnInit, Output, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp, buildUrl } from '@app/core/base-http';
import { Activity, ActivityType, Category, CreateActivityDto, Student, StudentActivity } from '@app/core/dto';

@Component({
    selector: 'app-inscription',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './inscription.component.html',
    styleUrls: ['./inscription.component.scss']
})
export class InscriptionComponent implements OnInit {
    onCancel() {
        this.activeTab = 'existing';
        this.selectedExistingStudent = null;
        this.newStudent = { name: '', birthdate: '' };
        this.complete.emit(false);
    }

    @Output() complete = new EventEmitter<boolean>();

    categories: Category[] = [];
    newActivities: Activity[] = [];
    activityTypes: ActivityType[] = [];
    maxBirthdate: string = '';
    filteredStudents: Student[] = [];
    selectedExistingStudent: Student | null = null;
    newStudent: { name: string; birthdate: string } = { name: '', birthdate: '' };
    activeTab: 'existing' | 'new' = 'existing';
    searchTerm: string = '';
    newCategoryId: number | null = null;
    newActivityId: number | null = null;
    newActivity: CreateActivityDto = {
        description: '',
        startDate: new Date(),
        endDate: new Date(),
        gracePeriod: 0,
        price: 0,
        categoryId: 0,
        typeId: 0
    };
    showPaymentModal: boolean = false;
    selectedStudentActivity: StudentActivity | null = null;

    constructor(private http: HttpClient) { }

    ngOnInit() {
        this.loadCategories();
        this.loadStudents();
        this.maxBirthdate = this.getFormattedDate(new Date());
    }

    loadCategories() {
        const categories = new BaseHttp(`categories`, this.http);
        categories.get<Category[]>().subscribe(result => {
            this.categories = result;
            if (this.categories.length > 0) {
                this.newCategoryId = this.categories[0].id;
                this.newActivity.categoryId = this.newCategoryId;
                this.onNewCategoryChange();
            }
        });
    }

    onNewCategoryChange() {
        const queryString = `categoryId=${this.newCategoryId}`;
        const activities = new BaseHttp(`activities?${queryString}`, this.http);
        activities.get<Activity[]>().subscribe(result => {
            this.newActivities = result;
            if (this.newActivities.length) {
                this.newActivityId = this.newActivities[0].id;
            }
        });
    }

    loadStudents() {
        const studentsAPI = new BaseHttp('students', this.http);
        studentsAPI.get<Student[]>().subscribe(students => {
            this.filteredStudents = students.map(student => {
                if (student.photo) {
                    student.photoUrl = buildUrl(`students/${student.id}/photo`);
                }
                return student;
            });
        });
    }

    filterStudents() {
        if (!this.searchTerm) {
            this.loadStudents();
            return;
        }
        const term = this.searchTerm.toLowerCase();
        this.filteredStudents = this.filteredStudents.filter(student =>
            student.name.toLowerCase().includes(term)
        );
    }


    selectStudent(student: Student) {
        this.selectedExistingStudent = student;
    }

    onInscription() {
        if (this.activeTab === 'existing' && this.selectedExistingStudent) {
            this.addStudentToActivity(this.selectedExistingStudent);
        } else if (this.activeTab === 'new' && this.newStudent.name) {
            this.createNewStudent();
        }
    }

    addStudentToActivity(student: Student) {
        const body = {
            studentId: student.id,
            activityId: this.newActivityId
        };
        new BaseHttp('student-activities', this.http)
            .post<typeof body, StudentActivity>(body)
            .subscribe(() => {
                this.selectedExistingStudent = null;
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

    getFormattedDate(date: Date): string {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = ('0' + (d.getMonth() + 1)).slice(-2);
        const day = ('0' + d.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
    }
}
