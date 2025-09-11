import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BaseHttp } from '@app/core/base-http';
import { Category, StudentCategory } from '@app/core/dto';
import { RequestQueryBuilder } from '@dataui/crud-request';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './student-info.component.html',
  styleUrls: ['./student-info.component.scss']
})
export class StudentInfoComponent {

  public isSaving: boolean = false;
  public categories: Category[] = [];
  public studentCategories: StudentCategory[] = [];
  public availableCategories: Category[] = [];
  public selectedCategoryId: number | null = null;

  private categoriesAPI: BaseHttp;
  private studentCategoriesAPI: BaseHttp;
  private studentId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {

    this.studentId = Number(this.route.parent!.snapshot.paramMap.get('id'));

    const queryString = RequestQueryBuilder.create({
      search: { studentId: this.studentId, },
    }).query();

    this.studentCategoriesAPI = new BaseHttp(`student-categories?${queryString}`, this.http);
    this.categoriesAPI = new BaseHttp('categories', this.http);
  }

  ngAfterViewInit(): void {

    Promise.all([
      this.categoriesAPI.get<Category[]>().toPromise(),
      this.studentCategoriesAPI.get<StudentCategory[]>().toPromise()
    ]).then(([categories, studentCategories]) => {
      this.categories = categories!;
      this.studentCategories = studentCategories!;

      this.availableCategories = this.categories.filter(category =>
        !studentCategories?.some(sc => sc.categoryId === category.id)
      );

      this.selectedCategoryId = this.availableCategories.length > 0 ? this.availableCategories[0].id : null;

    }).catch(err => {
      console.error('Error loading categories or student categories', err);
    });

  }

  addCategory(): void {

    if (!this.selectedCategoryId) {
      return
    }

    this.isSaving = true;
    this.studentCategoriesAPI.post({ studentId: this.studentId, categoryId: Number(this.selectedCategoryId) }).subscribe(
      (value: unknown) => {
        const studentCategory = value as StudentCategory;
        this.studentCategories.push(studentCategory);
        this.availableCategories = this.availableCategories.filter(cat => cat.id !== studentCategory.categoryId);
        this.selectedCategoryId = this.availableCategories.length > 0 ? this.availableCategories[0].id : null;
        this.isSaving = false;
      },
      (err) => {
        this.isSaving = false;
        console.error('Error adding category', err);
      }
    );
  }

  removeCategory(studentCategoryId: number): void {
    if (confirm('¿Estás seguro de quitar esta categoría al estudiante?')) {
      this.isSaving = true;
      const studentCategoriesAPI = new BaseHttp(`student-categories/${studentCategoryId}`, this.http);;
      studentCategoriesAPI.delete().subscribe({
        next: () => {
          this.studentCategories = this.studentCategories.filter(sc => sc.id !== studentCategoryId);
          this.availableCategories = this.categories.filter(category =>
            !this.studentCategories?.some(sc => sc.categoryId === category.id)
          );
          this.selectedCategoryId = this.availableCategories.length > 0 ? this.availableCategories[0].id : null;

          this.isSaving = false;
        },
        error: (err) => {
          this.isSaving = false;
          console.error('Error removing category', err);
        }
      });
    }
  }

}

