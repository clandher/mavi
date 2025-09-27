import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { Category } from '@app/core/dto';
import { FormGroupComponent } from "../form-group/form-group.component";
import { SubmitComponent } from '../submit/submit.component';
import { setFocus } from '@app/core/helpers';

@Component({
    selector: 'app-category',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormGroupComponent, SubmitComponent],
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.scss']
})
export class CategoryComponent {
    @Input() categoryId: number = 0;
    @Output() complete = new EventEmitter<boolean>();

    public categoryForm: FormGroup;

    constructor(
        private http: HttpClient,
        private fb: FormBuilder,
    ) {
        this.categoryForm = this.fb.group({
            type: ['', []]
        });
    }

    ngAfterViewInit(): void {
        this.loadCategory(this.categoryId);
    }

    loadCategory(id: number) {
        if (this.categoryId > 0) {
            const categoryAPI = new BaseHttp(`categories/${id}`, this.http);
            categoryAPI.get<Category>().subscribe(result => {
                this.categoryForm.patchValue({
                    type: result.type
                });

                setFocus('type');
            });
        } else {
            setFocus('type');
        }
    }

    saveCategory(): Promise<void> {
        return new Promise((resolve, reject) => {
            const formValue = this.categoryForm.value;
            const categoriesAPI = new BaseHttp(`categories`, this.http);

            if (this.categoryId !== 0) {
                categoriesAPI.patch<Category, Category>(this.categoryId, formValue).subscribe({
                    next: () => { this.complete.emit(true); resolve(); },
                    error: (err) => { console.error('Error updating category:', err); reject(err); }
                });
            } else {
                categoriesAPI.post<Category, Category>(formValue).subscribe({
                    next: () => { this.complete.emit(true); resolve(); },
                    error: (err) => { console.error('Error creating category:', err); reject(err); }
                });
            }
        });
    }

    closeModal(): void {
        this.complete.emit(false);
    }
}