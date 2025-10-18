import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { Activity, Category, Student, StudentActivity } from '@app/core/dto';
import { formatDateForDisplay } from '@app/core/helpers';
import { RequestQueryBuilder } from '@dataui/crud-request';
import { ActivatedRoute } from '@angular/router';
import { MaviValidators } from '@app/core/mavi-validators';
import { FormGroupComponent } from "../form-group/form-group.component";
import { ImageHttpClient } from '@app/core/image-http-client';
import { ModalInjectable, ModalService } from '@app/core/modal.service';
import { Subject } from 'rxjs';


export interface StudentView extends Student {
    selected: boolean;
    preselected: boolean;
}

@Component({
    selector: 'app-inscription',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, FormGroupComponent],
    templateUrl: './inscription.component.html',
    styleUrls: ['./inscription.component.scss']
})
export class InscriptionComponent implements OnInit, ModalInjectable {
    @Input() studentId: number | null = null;

    form: FormGroup;



    private _sort(): void {
        this.filteredStudents.sort((a, b) => {
            if (a.preselected && !b.preselected) return -1;
            if (b.preselected && !a.preselected) return 1;

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

    isStudentSelected(student: StudentView): boolean {
        return student.selected;
    }

    hasActivityAssigned(student: StudentView): boolean {
        if (!student.activities || !Array.isArray(student.activities) || student.activities.length === 0) return false;
        return student.activities.some(act => act.activityId === Number(this.form.get('activityId')?.value));
    }


    @Output() complete = new EventEmitter<boolean>();

    categories: Category[] = [];
    activities: Activity[] = [];
    maxBirthdate: string = '';
    selectedStudentActivity: StudentActivity | null = null;


    public selectedStudents = 0;
    students: StudentView[] = [];
    filteredStudents: StudentView[] = [];

    get studentForm(): FormGroup {
        return this.form.get('student') as FormGroup;
    }

    get disabled(): boolean {
        return this.form.get('tab')?.value === 'existing' && this.selectedStudents === 0;
    }

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private imageHttp: ImageHttpClient,
        private modalService: ModalService,
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

            if (!value) {
                value = '';
            }

            const term = value.toLowerCase();
            this.filteredStudents = this.students.filter(student =>
                student.name.toLowerCase().includes(term)
            );
            this._sort();
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
            this.imageHttp.student(student);
            student.selected = false;
            return student;
        });

        const studentToSelect = this.filteredStudents.find(s => s.id === this.studentId);
        if (studentToSelect) {
            studentToSelect.preselected = true;
            this.onSelectStudent(studentToSelect);
        }

        this._sort();
    }



    onNewCategoryChange() {
        const categoryId = this.form.get('categoryId')?.value;
        const queryString = RequestQueryBuilder.create({
            search: { categoryId: Number(categoryId) },
        }).query();

        const activities = new BaseHttp(`activities?${queryString}`, this.http);
        activities.get<Activity[]>().subscribe(result => {
            this.activities = result;

            if (this.activities.length === 0) {
                this.form.get('activityId')?.setValue(null);
                this.form.get('activityId')?.markAllAsTouched();
            } else {
                if (!this.form.get('activityId')?.value) {
                    this.form.get('activityId')?.setValue(this.activities[0].id);
                }
            }

            this._sort();
        });
    }

    onNewActivityChange() {
        this._sort();
    }

    _loadStudents(): Promise<void> {
        const studentsAPI = new BaseHttp('students', this.http);
        return new Promise(resolve => {
            studentsAPI.get<StudentView[]>().subscribe(students => {
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

    onSelectStudent(student: StudentView) {
        student.selected = !student.selected;
        this.form.markAsDirty();

        if (student.selected) {
            this.selectedStudents++;
        } else {
            this.selectedStudents--;
        }
    }

    async onSubmit() {

        const categoryId = this.form.get('categoryId')?.value;

        if (this.form.get('tab')?.value === 'existing' && this.students.some(student => student.selected)) {
            for (const student of this.students.filter(s => s.selected)) {
                const hasCategory = student.categories.some(sc => sc.categoryId === Number(categoryId));
                if (!hasCategory) {
                    const studentCategoriesAPI = new BaseHttp(`student-categories`, this.http);
                    await studentCategoriesAPI.post({ studentId: student.id, categoryId: Number(categoryId) }).toPromise();
                }
                await this._addStudentToActivityAsync(student);
            }

            this.complete.emit(true);
            this.students.forEach(student => student.selected = false);
        } else if (this.form.get('tab')?.value === 'new') {
            const newStudent = this.form.get('student')?.value;
            await this._createNewStudent(newStudent, categoryId);
        }
    }

    private async _addStudentToActivityAsync(student: Student): Promise<void> {
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
            studentCategoriesAPI.post({ studentId: createdStudent.id, categoryId: Number(categoryId) }).subscribe(async () => {
                await this._addStudentToActivityAsync(createdStudent);
                this.complete.emit(true);
            });
        });
    }

    private destroy$ = new Subject<void>();

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
