// student-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Student, Category } from '@app/core/dto';
import { HttpClient } from '@angular/common/http';
import { BaseHttp, buildUrl } from '@app/core/base-http';
import { CurrencyMXPipe } from "../../core/currency-mx.pipe";
import { RequestQueryBuilder } from '@dataui/crud-request';
import { PaymentComponent } from "../payment/payment.component";
import { setFocus } from '@app/core/helpers';

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, CurrencyMXPipe, PaymentComponent],
    templateUrl: './student-list.component.html',
    styleUrls: ['./student-list.component.scss']
})
export class StudentListComponent implements OnInit {
    openPaymentModal(student: Student) {
        this.selectedStudent = student;
        this.showPaymentModal = true;
    }

    onPaymentComplete($event: boolean) {
        this.showPaymentModal = false;
        if ($event) {
            this.loadStudents();
        }
    }

    students: Student[] = [];
    filteredStudents: Student[] = [];
    allCategories: Category[] = [];
    searchTerm: string = '';
    selectedCategory: number | null = null;
    isLoading = true;
    sortDebt: 'desc' | 'asc' = 'desc';

    selectedStudent: Student | null = null;
    showPaymentModal: boolean = false;

    private categoriesAPI: BaseHttp;

    constructor(private http: HttpClient) {
        this.categoriesAPI = new BaseHttp('categories', this.http);
    }

    ngOnInit(): void {
        this.loadStudents();
        this.loadCategories();
        setFocus('search');
    }

    loadStudents(): void {
        this.isLoading = true;


        const queryString = RequestQueryBuilder.create({
            // search: { id: 1 }
        })
            .setJoin([
                { field: 'activities' }
            ])
            .query();

        this.http.get<Student[]>(buildUrl(`students`)).subscribe({
            next: (students) => {
                this.students = students.map(student => {

                    if (student.photo) {
                        student.photoUrl = buildUrl(`students/${student.id}/photo`);
                    }

                    return student;
                });
                this.filteredStudents = [...students];
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading students', err);
                this.isLoading = false;
            }
        });
    }

    calculateAge(birthdate: string): number {
        if (!birthdate) return 0;

        const today = new Date();
        const birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }

    loadCategories(): void {
        this.categoriesAPI.get<Category[]>().subscribe({
            next: (categories) => {
                this.allCategories = categories;
            },
            error: (err) => {
                console.error('Error loading categories', err);
            }
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
    }

    sortByDebt(): void {
        if (this.sortDebt === 'desc') {
            this.filteredStudents.sort((a, b) => b.debt - a.debt);
        } else {
            this.filteredStudents.sort((a, b) => a.debt - b.debt);
        }
    }

    getCategoryName(categoryId: number): string {
        const category = this.allCategories.find(c => c.id === categoryId);
        return category ? category.type : 'Desconocida';
    }

    removeCategory(studentCategoryId: number): void {
        if (confirm('¿Estás seguro de quitar esta categoría al estudiante?')) {
            const studentCategoriesAPI = new BaseHttp(`student-categories`, this.http);;
            studentCategoriesAPI.delete(studentCategoryId).subscribe({
                next: () => {
                    this.loadStudents(); // Recargar la lista
                },
                error: (err) => {
                    console.error('Error removing category', err);
                }
            });
        }
    }

    hasActivitiesForCategory(student: any, categoryId: any): boolean {
        if (!student.activities || !Array.isArray(student.activities)) {
            return false;
        }
        return student.activities.some((act: any) => act.activity && act.activity.categoryId === categoryId);
    }
}