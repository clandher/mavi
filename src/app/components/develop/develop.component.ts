// student-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp, buildUrl } from '@app/core/base-http';
import { CreateSchoolDto, School } from '@app/core/dto';
import { SchoolService } from '@app/core/school.service';
import { FormGroupComponent } from "../form-group/form-group.component";
import { MaviValidators } from '@app/core/mavi-validators';

interface Category {
    id: number;
    type: string;
}

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, FormGroupComponent],
    templateUrl: './develop.component.html',
    styleUrls: ['./develop.component.scss']
})
export class DevelopComponent {
    isLoading = false; // Variable para controlar el loading

    schools: School[] = [];
    selectedSchoolTab: string = 'schools';

    categories: Category[] = [];
    categoryForm: FormGroup;

    get categoriesControls() {
        return (this.categoryForm.get('categories') as FormArray).controls;
    }

    private categoryHttp: BaseHttp;

    constructor(
        private fb: FormBuilder,
        private http: HttpClient,
        private schoolService: SchoolService
    ) {
        this.categoryForm = this.fb.group({
            newCategory: ['', [MaviValidators.required()]],
            categories: this.fb.array([])
        });
        this.categoryHttp = new BaseHttp('categories', this.http);
    }

    ngOnInit() {
        this.getSchools();
        this.loadCategories();
    }

    getSchools() {
        const schoolsAPI = new BaseHttp('schools', this.http);
        schoolsAPI.get().subscribe({
            next: (data: any) => {
                this.schools = data.map((school: any) => {
                    if (school.logo) {
                        school.logoUrl = buildUrl(`schools/${school.id}/logo`) + `?t=${new Date().getTime()}`;
                    }
                    return school;
                });
            },
            error: () => {
                // Manejo de error si lo deseas
            }
        });
    }

    saveSchool(school: School) {
        const schoolsAPI = new BaseHttp(`schools/${school.id}`, this.http);
        schoolsAPI.patch({
            description: school.description,
        }).subscribe({
            next: () => {
                // Actualización exitosa
            },
            error: () => {
                // Manejo de error si lo deseas
            }
        });
    }

    onLogoSelected(event: Event, school: School) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file || !school.id) return;

        const formData = new FormData();
        formData.append('file', file);

        const schoolsAPI = new BaseHttp(`schools/${school.id}/logo`, this.http);
        schoolsAPI.post<FormData, any>(formData).subscribe({
            next: (res) => {
                const timestamp = new Date().getTime();
                school.logoUrl = buildUrl(`schools/${school.id}/logo`) + `?t=${timestamp}`;
                this.schoolService.fetch();
            },
            error: (err) => {
                console.error('Error uploading logo', err);
            }
        });

        const reader = new FileReader();
        reader.onload = () => {
            school.logo = reader.result as string;
        };
        reader.readAsDataURL(file);

    }



    onRestart() {
        this.isLoading = true;
        const seederAPI = new BaseHttp('seeder', this.http,)
        seederAPI.post({}).subscribe({
            next: () => {
                console.log('Seeding completed');
            },
            error: () => {
                // Manejo de error si lo deseas
            },
            complete: () => {
                this.isLoading = false;
            }
        });
    }

    loadCategories(): void {
        this.isLoading = true;
        this.categoryHttp.get<Category[]>().subscribe(
            (data) => {
                this.categories = data;
                const categoryControls = data.map(category => this.fb.group({
                    id: category.id,
                    type: category.type
                }));
                this.categoryForm.setControl('categories', this.fb.array(categoryControls));
                this.isLoading = false;
            },
            (error) => {
                console.error('Error loading categories:', error);
                this.isLoading = false;
            }
        );
    }

    addCategory(): void {
        const newCategory = this.categoryForm.get('newCategory')?.value;
        if (!newCategory || !newCategory.trim()) return;

        // Validar que la categoría no exista (ignorando mayúsculas/minúsculas y espacios)
        const exists = this.categories.some(
            cat => cat.type.trim().toLowerCase() === newCategory.trim().toLowerCase()
        );
        if (exists) {
            this.categoryForm.get('newCategory')?.setErrors({ message: 'La categoría ya existe.' });
            return;
        }

        const category = { type: newCategory };
        this.categoryHttp.post<typeof category, Category>(category).subscribe(
            (createdCategory) => {
                this.categories.push(createdCategory);
                const categoriesArray = this.categoryForm.get('categories') as FormArray;
                categoriesArray.push(this.fb.group({
                    id: createdCategory.id,
                    type: createdCategory.type
                }));
                this.categoryForm.get('newCategory')?.reset();
            },
            (error) => {
                console.error('Error adding category:', error);
            }
        );
    }

    deleteCategory(categoryId: number, index: number): void {
        this.http.delete<void>(buildUrl(`categories/${categoryId}`)).subscribe(
            () => {
                this.categories = this.categories.filter((cat) => cat.id !== categoryId);
                const categoriesArray = this.categoryForm.get('categories') as FormArray;
                categoriesArray.removeAt(index);
            },
            (error) => {
                console.error('Error deleting category:', error);
            }
        );
    }
}