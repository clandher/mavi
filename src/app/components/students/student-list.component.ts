// student-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Student, Category } from '@app/core/dto';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './student-list.component.html',
    styleUrls: ['./student-list.component.scss']
})
export class StudentListComponent implements OnInit {
    students: Student[] = [];
    filteredStudents: Student[] = [];
    allCategories: Category[] = [];
    searchTerm: string = '';
    selectedCategory: number | null = null;
    isLoading = true;


    private studentsAPI: BaseHttp;
    private categoriesAPI: BaseHttp;

    constructor(private http: HttpClient) {
        this.studentsAPI = new BaseHttp('students', this.http);
        this.categoriesAPI = new BaseHttp('categories', this.http);
    }

    ngOnInit(): void {
        this.loadStudents();
        this.loadCategories();
    }

    loadStudents(): void {
        this.isLoading = true;
        this.studentsAPI.get<Student[]>().subscribe({
            next: (students) => {
                this.students = students;
                this.filteredStudents = [...students];
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading students', err);
                this.isLoading = false;
            }
        });
    }

    calculateAge(birthdate: Date): number {
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
                student.categories?.some(c => this.selectedCategory ?? c.categoryId === this.selectedCategory);

            return matchesSearch && matchesCategory;
        });
    }

    getCategoryName(categoryId: number): string {
        const category = this.allCategories.find(c => c.id === categoryId);
        return category ? category.type : 'Desconocida';
    }

    removeCategory(studentCategoryId: number): void {
        if (confirm('¿Estás seguro de quitar esta categoría al estudiante?')) {
            const studentCategoriesAPI = new BaseHttp(`student-categories/${studentCategoryId}`, this.http);;
            studentCategoriesAPI.delete().subscribe({
                next: () => {
                    this.loadStudents(); // Recargar la lista
                },
                error: (err) => {
                    console.error('Error removing category', err);
                }
            });
        }
    }
}