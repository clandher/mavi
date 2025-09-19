import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp, buildUrl } from '@app/core/base-http';
import { Activity, ActivityType, Category, Student, StudentActivity } from '@app/core/dto';
import { formatDateForDisplay } from '@app/core/helpers';
import { RequestQueryBuilder } from '@dataui/crud-request';
import { ActivatedRoute } from '@angular/router';
import { SubmitComponent } from "../submit/submit.component";
import { MaviValidators } from '@app/core/mavi-validators';
import { FormGroupComponent } from "../form-group/form-group.component";

@Component({
    selector: 'app-inscription',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, SubmitComponent, FormGroupComponent],
    templateUrl: './inscription.component.html',
    styleUrls: ['./inscription.component.scss']
})
export class InscriptionComponent implements OnInit {
    form: FormGroup;

    private sortStudents(): Student[] {
        return this.filteredStudents.slice().sort((a, b) => {
            const hasCategoryA = a.categories && a.categories.length > 0 && a.categories.some(sc => sc.categoryId && sc.categoryId !== 0);
            const hasCategoryB = b.categories && b.categories.length > 0 && b.categories.some(sc => sc.categoryId && sc.categoryId !== 0);
            const inscritoA = hasCategoryA && a.activities && a.activities.some(act => act.activityId === Number(this.form.get('activityId')?.value));
            const inscritoB = hasCategoryB && b.activities && b.activities.some(act => act.activityId === Number(this.form.get('activityId')?.value));
            if (hasCategoryA && !inscritoA && (!hasCategoryB || inscritoB)) return -1;
            if (hasCategoryB && !inscritoB && (!hasCategoryA || inscritoA)) return 1;
            if (hasCategoryA && inscritoA && (!hasCategoryB || !inscritoB)) return -1;
            if (hasCategoryB && inscritoB && (!hasCategoryA || !inscritoA)) return 1;
            if (hasCategoryA && !hasCategoryB) return -1;
            if (hasCategoryB && !hasCategoryA) return 1;
            return 0;
        });
    }
    isStudentSelected(student: Student): boolean {
        return this.selectedExistingStudents.some(s => s.id === student.id);
    }

    hasActivityAssigned(student: Student): boolean {
        if (!student.activities || !Array.isArray(student.activities) || student.activities.length === 0) return false;
        return student.activities.some(act => act.activityId === Number(this.form.get('activityId')?.value));
    }

    onCancel() {
        this.selectedExistingStudents = [];
        this.form.get('student')?.reset();
        this.complete.emit(false);
    }

    @Output() complete = new EventEmitter<boolean>();

    categories: Category[] = [];
    activities: Activity[] = [];
    maxBirthdate: string = '';
    students: Student[] = [];
    filteredStudents: Student[] = [];
    selectedExistingStudents: Student[] = [];
    selectedStudentActivity: StudentActivity | null = null;



    get studentForm(): FormGroup {
        return this.form.get('student') as FormGroup;
    }

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            categoryId: [null, MaviValidators.required()],
            activityId: [null, MaviValidators.required()],
            search: [''],
            tab: ['existing'],
            student: this.fb.group({
                name: [''],
                birthdate: ['']
            })
        });

        this.route.queryParams.subscribe(params => {
            const categoryId = params['category'];
            const activityId = params['activity'];

            if (categoryId) {
                this.form.get('categoryId')?.setValue(+categoryId);
            }

            if (activityId) {
                this.form.get('activityId')?.setValue(+activityId);
            }
        });

        this.form.get('search')?.valueChanges.subscribe(value => {
            this.filteredStudents = this.students.filter(student =>
                student.name.toLowerCase().includes(value.toLowerCase())
            );
            this.filteredStudents = this.sortStudents();
        });

        this.form.get('tab')?.valueChanges.subscribe(value => {
            if (value === 'new') {
                (this.form.get('student') as FormGroup)?.controls['name'].setValidators([MaviValidators.required()]);
                (this.form.get('student') as FormGroup)?.controls['name'].updateValueAndValidity();
                (this.form.get('student') as FormGroup)?.controls['birthdate'].setValidators([MaviValidators.required()]);
                (this.form.get('student') as FormGroup)?.controls['birthdate'].updateValueAndValidity();
            } else if (value === 'existing') {
                (this.form.get('student') as FormGroup)?.controls['name'].clearValidators();
                (this.form.get('student') as FormGroup)?.controls['name'].updateValueAndValidity();
                (this.form.get('student') as FormGroup)?.controls['birthdate'].clearValidators();
                (this.form.get('student') as FormGroup)?.controls['birthdate'].updateValueAndValidity();
            }
        });

    }

    async ngOnInit() {
        this.maxBirthdate = formatDateForDisplay(new Date());
        await Promise.all([
            this._loadCategories(),
            this._loadStudents()
        ]);

        this.filteredStudents = this.students.map(student => {
            student.categories = student.categories.map(studentCategory => {
                studentCategory.category = this.categories.find(c => c.id === studentCategory.categoryId) || { id: 0, type: '-', students: [], activities: [] };
                return studentCategory;
            });

            if (student.photo) {
                student.photoUrl = buildUrl(`students/${student.id}/photo`);
            }

            return student;
        });

        this.filteredStudents = this.sortStudents();
    }



    onNewCategoryChange() {
        const categoryId = this.form.get('categoryId')?.value;
        const queryString = RequestQueryBuilder.create({
            search: { categoryId: Number(categoryId) },
        }).query();

        const activities = new BaseHttp(`activities?${queryString}`, this.http);
        activities.get<Activity[]>().subscribe(result => {
            this.activities = result;
            if (this.activities.length > 0 && !this.form.get('activityId')?.value) {
                this.form.get('activityId')?.setValue(this.activities[0].id);
            }
            this.filteredStudents = this.sortStudents();
        });
    }

    onNewActivityChange() {
        this.filteredStudents = this.sortStudents();
    }

    _loadStudents(): Promise<void> {
        const studentsAPI = new BaseHttp('students', this.http);
        return new Promise(resolve => {
            studentsAPI.get<Student[]>().subscribe(students => {
                this.students = students;
                resolve();
            });
        });
    }

    _loadCategories(): Promise<void> {
        const categories = new BaseHttp(`categories`, this.http);
        return new Promise(resolve => {
            categories.get<Category[]>().subscribe(result => {
                this.categories = result;
                if (this.categories.length > 0 && !this.form.get('categoryId')?.value) {
                    this.form.get('categoryId')?.setValue(this.categories[0].id);
                }
                this.onNewCategoryChange();
                resolve();
            });
        });
    }

    onSelectStudent(student: Student) {
        const idx = this.selectedExistingStudents.findIndex(s => s.id === student.id);
        if (idx > -1) {
            this.selectedExistingStudents.splice(idx, 1);
        } else {
            this.selectedExistingStudents.push(student);
        }

        this.form.markAsDirty();
    }

    async onInscription() {

        const categoryId = this.form.get('categoryId')?.value;

        if (this.form.get('tab')?.value === 'existing' && this.selectedExistingStudents.length > 0) {
            const promises = this.selectedExistingStudents.map(async student => {
                const hasCategory = student.categories.some(sc => sc.categoryId === Number(categoryId));
                if (!hasCategory) {
                    const studentCategoriesAPI = new BaseHttp(`student-categories`, this.http);
                    await studentCategoriesAPI.post({ studentId: student.id, categoryId: Number(categoryId) }).toPromise();
                }
                await this._addStudentToActivityAsync(student);
            });

            await Promise.all(promises);
            this.complete.emit(true);
            this.selectedExistingStudents = [];
        } else if (this.form.get('tab')?.value === 'new') {
            const newStudent = this.form.get('student')?.value;
            await this._createNewStudent(newStudent, categoryId);
        }
    }

    private async _addStudentToActivityAsync(student: Student) {
        const body = {
            studentId: student.id,
            activityId: Number(this.form.get('activityId')?.value),
        };
        await new BaseHttp('student-activities', this.http)
            .post<typeof body, StudentActivity>(body)
            .toPromise();
        this.form.get('student')?.reset();
    }


    private _createNewStudent(newStudent: { name: string; birthdate: string }, categoryId: number) {
        const birthdate = new Date(newStudent.birthdate);
        const newStudentData = {
            name: newStudent.name,
            birthdate: birthdate
        };

        const studentsAPI = new BaseHttp('students', this.http);
        studentsAPI.post<typeof newStudentData, Student>(newStudentData).subscribe(createdStudent => {
            const studentCategoriesAPI = new BaseHttp(`student-categories`, this.http);
            studentCategoriesAPI.post({ studentId: createdStudent.id, categoryId: Number(categoryId) }).subscribe(() => {
                this._addStudentToActivityAsync(createdStudent);
                this.complete.emit(true);
            });
        });
    }
}
