import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BaseHttp } from '@app/core/base-http';
import { Student, Category, CreateStudentDto, UpdateStudentDto } from '@app/core/dto';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './student-info.component.html',
  styleUrls: ['./student-info.component.scss']
})
export class StudentInfoComponent {

  activeTab: string = 'info';
  student: Student = {
    id: 0,
    name: '',
    birthdate: new Date(),
    debt: 0,
    categories: [],
    activities: [],
    payments: [],
  };

  allCategories: Category[] = [];
  availableCategories: Category[] = [];
  newCategoryId: number | null = null;
  isSaving = false;
  isLoading = true;
  isNewStudent = false;

  public maxBirthdate = new Date();

  private categoriesAPI: BaseHttp;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    this.categoriesAPI = new BaseHttp('categories', this.http);
  }

  ngOnInit(): void {
    const studentId = this.route.parent!.snapshot.paramMap.get('id');
    console.log(studentId);
    this.loadStudent(+studentId!);
    this.loadCategories();
  }

  loadStudent(id: number): void {
    this.isLoading = true;

    const studentsAPI = new BaseHttp(`students/${id}`, this.http);
    studentsAPI.get<Student>().subscribe({
      next: (student) => {
        student.birthdate = new Date(student.birthdate);
        this.student = student;
        this.isLoading = false;
        this.updateAvailableCategories();
      },
      error: (err) => {
        console.error('Error loading student', err);
        this.isLoading = false;
        this.router.navigate(['/app/students']);
      }
    });
  }

  getFormattedDate(date: Date): string {
    if (!date) return '';

    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);

    return `${year}-${month}-${day}`;
  }


  setDateFromString(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.student.birthdate = new Date(value);
    // rest of your method logic
  }

  loadCategories(): void {
    this.categoriesAPI.get<Category[]>().subscribe({
      next: (categories) => {
        this.allCategories = categories;
        this.updateAvailableCategories();
      },
      error: (err) => {
        console.error('Error loading categories', err);
      }
    });
  }

  updateAvailableCategories(): void {
    // Filtrar categorías disponibles
    this.availableCategories = this.allCategories.filter(category =>
      !this.student.categories?.some(sc => sc.categoryId === category.id)
    );

    this.newCategoryId = this.availableCategories.length > 0 ? this.availableCategories[0].id : null;

    // Si quieres actualizar las categorías del estudiante con la información completa
    if (this.student.categories) {
      this.student.categories = this.student.categories.map(sc => {
        // Encontrar la categoría completa en allCategories
        const fullCategory = this.allCategories.find(c => c.id === sc.categoryId);
        // Devolver el objeto con toda la información
        return {
          ...sc,
          category: fullCategory!, // o fullCategory?.description según tu modelo
        };
      });
    }

    console.log(this.student);
  }

  saveStudent(): void {
    this.isSaving = true;

    if (this.isNewStudent) {
      this.createStudent();
    } else {
      this.updateStudent();
    }
  }

  private createStudent(): void {
    const studentsAPI = new BaseHttp('students', this.http);
    const createStudentDto: CreateStudentDto = {
      name: this.student.name,
      birthdate: this.student.birthdate
    };

    studentsAPI.post<CreateStudentDto, Student>(createStudentDto).subscribe({
      next: (createdStudent) => {
        this.student = createdStudent;
        this.isNewStudent = false;
        this.isSaving = false;
        this.router.navigate(['/app/students', createdStudent.id, 'edit']);
      },
      error: (err) => {
        console.error('Error creating student', err);
        this.isSaving = false;
      }
    });
  }

  private updateStudent(): void {
    const studentsAPI = new BaseHttp(`students/${this.student.id}`, this.http);
    const updateStudentDto: UpdateStudentDto = {
      name: this.student.name,
      birthdate: this.student.birthdate,
    };

    studentsAPI.patch(updateStudentDto).subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/app/students']);
      },
      error: (err) => {
        console.error('Error saving student', err);
        this.isSaving = false;
      }
    });
  }

  addCategory(): void {
    if (this.newCategoryId && !this.isNewStudent) {
      const studentCategoriesAPI = new BaseHttp(`student-categories`, this.http);
      studentCategoriesAPI.post({ studentId: this.student.id, categoryId: Number(this.newCategoryId) }).subscribe({
        next: () => {
          this.loadStudent(this.student.id);
        },
        error: (err) => {
          console.error('Error adding category', err);
        }
      });
    }
  }

  removeCategory(studentCategoryId: number): void {
    if (confirm('¿Estás seguro de quitar esta categoría al estudiante?')) {
      const studentCategoriesAPI = new BaseHttp(`student-categories/${studentCategoryId}`, this.http);;
      studentCategoriesAPI.delete().subscribe({
        next: () => {
          this.loadStudent(this.student.id);
        },
        error: (err) => {
          console.error('Error removing category', err);
        }
      });
    }
  }

  getAge(birthdate: Date): number {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  // Si necesitas manejar el formato de fecha
  formatDateForInput(date: Date): string {
    return date ? new Date(date).toISOString().split('T')[0] : '';
  }

}