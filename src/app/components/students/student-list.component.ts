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

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, CurrencyMXPipe, PaymentComponent],
    templateUrl: './student-list.component.html',
    styleUrls: ['./student-list.component.scss']
})
export class StudentListComponent implements OnInit, AfterViewInit {


    students: Student[] = [];
    categories: Category[] = [];

    filteredStudents: Student[] = [];
    searchTerm: string = '';
    selectedCategory: number | null = null;
    isLoading = true;
    sortDebt: 'desc' | 'asc' = 'desc';

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
            this.searchTerm = params['searchTerm'] || '';
            this.selectedCategory = params['selectedCategory'] ? +params['selectedCategory'] : null;
            this.sortDebt = params['sortDebt'] || 'desc';

        });
        this.fetchData();
        setFocus('search');
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
                    // this.filteredStudents = [...this.students];
                    this.filterStudents();
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

    filterStudents(): void {
        this.filteredStudents = this.students.filter(student => {
            const matchesSearch = student.name.toLowerCase().includes(this.searchTerm.toLowerCase());
            const matchesCategory = this.selectedCategory === null ||
                student.categories?.some(c => c.categoryId === this.selectedCategory);

            return matchesSearch && matchesCategory;
        });
        this.sortByDebt();

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                searchTerm: this.searchTerm || null,
                selectedCategory: this.selectedCategory || null,
                sortDebt: this.sortDebt || null
            },
            queryParamsHandling: 'merge'
        });
    }

    sortByDebt(): void {
        if (this.sortDebt === 'desc') {
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