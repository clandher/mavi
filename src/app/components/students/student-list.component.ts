// student-list.component.ts
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Student, Category } from '@app/core/dto';
import { HttpClient } from '@angular/common/http';
import { BaseHttp, buildUrl } from '@app/core/base-http';
import { CurrencyMXPipe } from "../../core/currency-mx.pipe";
import { PaymentComponent } from "../payment/payment.component";
import { setFocus } from '@app/core/helpers';
import { ImageHttpClient } from '@app/core/image-http-client';
import { FormGroupComponent } from "../form-group/form-group.component";

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, CurrencyMXPipe, PaymentComponent, FormGroupComponent],
    templateUrl: './student-list.component.html',
    styleUrls: ['./student-list.component.scss']
})
export class StudentListComponent implements OnInit, AfterViewInit {


    students: Student[] = [];
    categories: Category[] = [];

    filteredStudents: Student[] = [];

    public filters: { name: string, categoryId: number | null, debt: 'desc' | 'asc' } = { name: '', categoryId: null, debt: 'desc' };

    isLoading = true;

    selectedStudent: Student | null = null;
    showPaymentModal: boolean = false;

    private categoriesAPI: BaseHttp;

    @ViewChild('studentListContainer', { static: false }) studentListContainer!: ElementRef;

    private observer: IntersectionObserver | null = null;

    constructor(
        private http: HttpClient,
        private imageHttp: ImageHttpClient,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.categoriesAPI = new BaseHttp('categories', this.http);
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
            .then(() => this._fetchStudents())
            .then(() => {
                this.isLoading = false;
            })
            .catch((err) => {
                console.error('Error loading data', err);
                this.isLoading = false;
            });
    }

    private _fetchStudents(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.http.get<Student[]>(buildUrl(`students`)).subscribe({
                next: (students) => {
                    this.students = students.map(student => {
                        student.categories = student.categories.map(sc => {
                            const category = this.categories.find(c => c.id === sc.categoryId);
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

        console.log('Filtered name:', this.filters.name);
        console.log('Filtered debt:', this.filters.debt);

        // Guardar el filtro de deuda en el localStorage
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