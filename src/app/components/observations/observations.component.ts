import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp, buildUrl } from '@app/core/base-http';
import { Activity, Category, Student, StudentActivity } from '@app/core/dto';
import { RequestQueryBuilder } from '@dataui/crud-request';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { ImageHttpClient } from '@app/core/image-http-client';
import { SubmitComponent } from '../submit/submit.component';
import { BtnLoadingComponent } from "../btn-loading/btn-loading.component";

interface StudentView extends Student {
    selected: boolean;
}

@Component({
    selector: 'app-observations',
    standalone: true,
    imports: [CommonModule, FormsModule, SubmitComponent, BtnLoadingComponent],
    templateUrl: './observations.component.html',
    styleUrls: ['./observations.component.scss']
})
export class ObservationsComponent implements OnInit {
    @Input() studentId!: number;
    // @Input() studentActivity!: StudentActivity;
    @Output() complete = new EventEmitter<boolean>();

    observationSearchTerm: string = '';
    filteredObservations: string[] = [];

    public selectedStudents = 0;


    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private imageHttp: ImageHttpClient,
        private router: Router,
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



    onObservationSearch() {
        const term = this.observationSearchTerm.toLowerCase();
        this.filteredObservations = this.trainingObservations.filter(obs =>
            obs.toLowerCase().includes(term)
        );
    }

    onCancel() {
        this.complete.emit(false);
    }


    categories: Category[] = [];
    activities: Activity[] = [];
    students: StudentView[] = [];
    filteredStudents: StudentView[] = [];

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

            this.imageHttp.student(student);
            student.selected = false;
            return student;
        });


        const studentToSelect = this.filteredStudents.find(s => s.id === this.studentId);
        if (studentToSelect) {
            this.onSelectStudent(studentToSelect);
        }

        this.sort();

        this.filteredObservations = [...this.trainingObservations];
    }



    private sort() {
        this.filteredStudents.sort((a, b) => {
            if (a.selected && !b.selected) return -1;
            if (!a.selected && b.selected) return 1;
            return 0;
        });
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
        this.sort();
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
                if (this.categories.length > 0 && !this.newCategoryId) {
                    this.newCategoryId = this.categories[0].id;
                }
                this.onNewCategoryChange();
                resolve();
            });
        });
    }



    onSelectStudent(student: StudentView) {
        student.selected = !student.selected;
        if (student.selected) {
            this.selectedStudents++;
        } else {
            this.selectedStudents--;
        }
    }




    async onAssignObservations(navigate: boolean = false) {
        const studentObservationsAPI = new BaseHttp(`student-observations`, this.http);
        const activityId = Number(this.newActivityId);
        const requests: Promise<boolean>[] = [];
        for (const student of this.students.filter(s => s.selected)) {
            for (const observation of this.selectedObservations) {
                const payload = {
                    studentId: student.id,
                    observation,
                    activityId
                };
                requests.push(new Promise(resolve => {
                    studentObservationsAPI.post(payload).subscribe(
                        () => resolve(true),
                        () => resolve(false)
                    );
                }));
            }
        }
        const results = await Promise.all(requests);
        const allSucceeded = results.every(r => r);
        if (allSucceeded) {
            this.complete.emit(true);
            this.selectedObservations = [];

            const selectedStudent = this.students.find(s => s.selected);
            if (navigate && this.selectedStudents === 1 && selectedStudent) {
                this.router.navigate(['/app/estudiantes', selectedStudent.id, 'editar', 'observaciones']);
            }
        }
    }
}
