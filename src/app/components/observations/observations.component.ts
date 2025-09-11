import { Component, EventEmitter, Input, OnInit, Output, output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp, buildUrl } from '@app/core/base-http';
import { Activity, ActivityType, Category, CreateActivityDto, Student, StudentActivity } from '@app/core/dto';
import { formatDateForDisplay } from '@app/core/helpers';
import { RequestQueryBuilder } from '@dataui/crud-request';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-observations',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './observations.component.html',
    styleUrls: ['./observations.component.scss']
})
export class ObservationsComponent implements OnInit {
    @Input() studentActivityId: number | null = null;
    @Output() complete = new EventEmitter<boolean>();



    observationSearchTerm: string = '';
    filteredObservations: string[] = [];
    onObservationSearch() {
        const term = this.observationSearchTerm.toLowerCase();
        this.filteredObservations = this.trainingObservations.filter(obs =>
            obs.toLowerCase().includes(term)
        );
    }

    isStudentSelected(student: Student): boolean {
        return this.selectedExistingStudents.some(s => s.id === student.id);
    }


    onCancel() {
        this.selectedExistingStudents = [];
        this.complete.emit(false);
    }


    categories: Category[] = [];
    activities: Activity[] = [];
    students: Student[] = [];
    filteredStudents: Student[] = [];
    selectedExistingStudents: Student[] = [];
    searchTerm: string = '';
    newCategoryId: number | null = null;
    newActivityId: number | null = null;

    // Observaciones de entrenamiento de fútbol
    trainingObservations: string[] = [
        'Buena actitud en el entrenamiento',
        'Mejorar la precisión en los pases',
        'Excelente desempeño físico',
        'Debe trabajar en la resistencia',
        'Participa activamente en los ejercicios',
        'Necesita mejorar la comunicación en el campo',
        'Gran capacidad de liderazgo',
        'Debe enfocarse en la técnica de tiro',
        'Muestra compromiso y disciplina',
        'Debe mejorar la marcación defensiva',
        'Destaca en el trabajo en equipo',
        'Debe prestar atención a las indicaciones del entrenador',
        'Excelente control del balón',
        'Debe mejorar la velocidad de reacción',
        'Gran progreso en la táctica grupal'
    ];
    selectedObservations: string[] = [];

    showPaymentModal: boolean = false;
    selectedStudentActivity: StudentActivity | null = null;
    // Métodos para selección de observaciones
    toggleObservation(obs: string) {
        const idx = this.selectedObservations.indexOf(obs);
        if (idx > -1) {
            this.selectedObservations.splice(idx, 1);
        } else {
            this.selectedObservations.push(obs);
        }
    }

    isObservationSelected(obs: string): boolean {
        return this.selectedObservations.includes(obs);
    }

    onAssignObservations() {
        this.complete.emit(true);
        this.selectedExistingStudents = [];
        this.selectedObservations = [];
    }

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
    ) {

        this.route.queryParams.subscribe(params => {
            const categoryId = params['category'];
            const activityId = params['activity'];

            if (categoryId) {
                this.newCategoryId = +categoryId;
            }
            if (activityId) {
                this.newActivityId = +activityId;
            }
        });
    }

    async ngOnInit() {
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

        this.filteredObservations = [...this.trainingObservations];
    }



    onNewCategoryChange() {
        const queryString = RequestQueryBuilder.create({
            search: { categoryId: Number(this.newCategoryId) },
        }).query();

        const activities = new BaseHttp(`activities?${queryString}`, this.http);
        activities.get<Activity[]>().subscribe(result => {
            this.activities = result;
            if (this.activities.length > 0 && !this.newActivityId) {
                this.newActivityId = this.activities[0].id;
            }
        });
    }

    onNewActivityChange() {
    }

    onSearch() {
        const term = this.searchTerm.toLowerCase();
        this.filteredStudents = this.students.filter(student =>
            student.name.toLowerCase().includes(term)
        );
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
                if (this.categories.length > 0 && !this.newCategoryId) {
                    this.newCategoryId = this.categories[0].id;
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
    }



    private _createNewStudent() {
        const studentCategoriesAPI = new BaseHttp(`student-categories`, this.http)
        studentCategoriesAPI.post({ studentId: 1, categoryId: Number(this.newCategoryId) }).subscribe(() => {
            this.complete.emit(true);
        });
    }
}
