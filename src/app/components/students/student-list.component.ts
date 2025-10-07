// student-list.component.ts
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Student, Category, Activity, ActivityType, StudentActivity, StudentCategory } from '@app/core/dto';
import { HttpClient } from '@angular/common/http';
import { BaseHttp, buildUrl } from '@app/core/base-http';
import { CurrencyMXPipe } from "../../core/currency-mx.pipe";
import { PaymentComponent } from "../payment/payment.component";
import { setFocus } from '@app/core/helpers';
import { ImageHttpClient } from '@app/core/image-http-client';
import { FormGroupComponent } from "../form-group/form-group.component";



interface StudentCategoryView extends StudentCategory {
    showPastActivities: boolean;
    activitiesCurrent: StudentActivity[];
    activitiesPast: StudentActivity[];
}

interface StudentView extends Student {
    categories: StudentCategoryView[];
}

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, CurrencyMXPipe, PaymentComponent, FormGroupComponent],
    templateUrl: './student-list.component.html',
    styleUrls: ['./student-list.component.scss']
})
export class StudentListComponent implements OnInit, AfterViewInit {
    togglePastActivities(_t53: StudentView) {
        throw new Error('Method not implemented.');
    }


    students: StudentView[] = [];
    categories: Category[] = [];

    filteredStudents: StudentView[] = [];

    public filters: { name: string, categoryId: number | null, debt: 'desc' | 'asc' } = { name: '', categoryId: null, debt: 'desc' };

    isLoading = true;

    selectedStudent: Student | null = null;
    showPaymentModal: boolean = false;

    private categoriesAPI: BaseHttp;
    private activityTypesAPI: BaseHttp; // API for activity types

    activities: Activity[] = []; // Store all activities
    activityTypes: ActivityType[] = []; // Store all activity types

    @ViewChild('studentListContainer', { static: false }) studentListContainer!: ElementRef;

    private observer: IntersectionObserver | null = null;

    constructor(
        private http: HttpClient,
        private imageHttp: ImageHttpClient,
        private route: ActivatedRoute,
        public router: Router
    ) {
        this.categoriesAPI = new BaseHttp('categories', this.http);
        this.activityTypesAPI = new BaseHttp('activity-types', this.http); // Initialize activity types API
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.filters.name = params['name'] || '';
            this.filters.categoryId = params['categoryId'] ? +params['categoryId'] : null;
            this.filters.debt = params['debt'] || localStorage.getItem('filter.debt') || 'desc';

            // Guardar el filtro de deuda en el localStorage
            localStorage.setItem('filter.debt', this.filters.debt);
        });
        this.fetchData();
        setFocus('name');
    }

    ngAfterViewInit(): void {
        this.initializeObserver();
    }

    openPaymentModal(student: Student) {
        this.selectedStudent = student;
        this.showPaymentModal = true;
    }

    onPaymentComplete($event: boolean) {
        this.showPaymentModal = false;
        if ($event) {
            this._fetchStudents();
        }
    }

    onRestartFilters() {
        this.filters = { name: '', categoryId: null, debt: 'desc' };
        this.applyFilters();
    }


    private fetchData(): void {
        this.isLoading = true;

        this._fetchCategories()
            .then(() => this._fetchActivityTypes()) // Fetch activity types
            .then(() => this._fetchStudents())
            .then(() => {
                this.isLoading = false;
            })
            .catch((err) => {
                console.error('Error loading data', err);
                this.isLoading = false;
            });
    }

    private _fetchActivityTypes(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.activityTypesAPI.get<ActivityType[]>().subscribe({
                next: (activityTypes) => {
                    this.activityTypes = activityTypes;
                    resolve();
                },
                error: (err) => {
                    console.error('Error loading activity types', err);
                    reject(err);
                }
            });
        });
    }

    private _fetchStudents(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.http.get<StudentView[]>(buildUrl(`students`)).subscribe({
                next: (students) => {
                    this.students = students.map(student => {


                        student.activities = student.activities.map(sa => {
                            const activityType = this.activityTypes.find(at => at.id === sa.activity.typeId);
                            if (activityType) {
                                sa.activity.type = activityType;
                            }
                            return sa;
                        });

                        student.activities.sort((a, b) => new Date(b.activity.startDate).getTime() - new Date(a.activity.startDate).getTime());

                        const today = new Date();
                        student.categories = student.categories.map(sc => {
                            const category = this.categories.find(c => c.id === sc.categoryId);

                            sc.activitiesCurrent = student.activities.filter(act => new Date(act.activity.endDate) >= today && act.activity.categoryId === sc.categoryId);
                            sc.activitiesPast = student.activities.filter(act => new Date(act.activity.endDate) < today && act.activity.categoryId === sc.categoryId);
                            sc.category = category!;
                            return sc;
                        });

                        return student;
                    });
                    this.applyFilters();
                    setTimeout(() => this.initializeObserver(), 0);
                    resolve();
                },
                error: (err) => {
                    console.error('Error loading students', err);
                    reject(err);
                }
            });
        });
    }

    private _fetchCategories(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.categoriesAPI.get<Category[]>().subscribe({
                next: (categories) => {
                    this.categories = categories;
                    resolve();
                },
                error: (err) => {
                    console.error('Error loading categories', err);
                    reject(err);
                }
            });
        });
    }

    applyFilters(): void {
        this.filteredStudents = this.students.filter(student => {
            const matchesSearch = student.name.toLowerCase().includes(this.filters.name.toLowerCase());
            const matchesCategory = this.filters.categoryId === null ||
                student.categories?.some(c => c.categoryId === this.filters.categoryId);

            return matchesSearch && matchesCategory;
        });
        this.sortByDebt();

        localStorage.setItem('filter.debt', this.filters.debt);

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                name: this.filters.name || null,
                categoryId: this.filters.categoryId || null,
                debt: this.filters.debt || null
            },
            queryParamsHandling: 'merge'
        });
    }

    sortByDebt(): void {
        if (this.filters.debt === 'desc') {
            this.filteredStudents.sort((a, b) => b.debt - a.debt);
        } else {
            this.filteredStudents.sort((a, b) => a.debt - b.debt);
        }
    }


    private initializeObserver(): void {
        if (!this.studentListContainer) {
            console.error('Student list container not found');
            return;
        }

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const studentId = entry.target.getAttribute('data-student-id');
                    if (studentId) {
                        this.loadStudentPhoto(parseInt(studentId, 10));
                        this.observer?.unobserve(entry.target); // Stop observing once loaded
                    }
                }
            });
        }, {
            root: null, // Use the viewport as the root
            rootMargin: '0px',
            threshold: 0.1
        });

        const studentElements = this.studentListContainer.nativeElement.querySelectorAll('.student-item');
        if (studentElements.length === 0) {
            console.warn('No student items found to observe');
        }

        studentElements.forEach((element: HTMLElement) => {
            this.observer?.observe(element);
        });
    }

    private loadStudentPhoto(studentId: number): void {
        const student = this.students.find(s => s.id === studentId);
        if (student) {
            this.imageHttp.student(student);
        }
    }

    ngOnDestroy(): void {
        this.observer?.disconnect();
    }
}