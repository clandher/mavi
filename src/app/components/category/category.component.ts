import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { Category } from '@app/core/dto';
import { FormGroupComponent } from "../form-group/form-group.component";
import { setFocus } from '@app/core/helpers';
import { ModalInjectable, ModalService } from '@app/core/modal.service';

@Component({
    selector: 'app-category',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormGroupComponent],
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements ModalInjectable {
    disabled: boolean = false;

    @Input() categoryId: number = 0;
    @Output() complete = new EventEmitter<boolean>();

    public form: FormGroup;

    constructor(
        private http: HttpClient,
        private fb: FormBuilder,
    ) {
        this.form = this.fb.group({
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
                this.form.patchValue({
                    type: result.type
                });

                setFocus('type');
            });
        } else {
            setTimeout(() => {
                setFocus('type');
            }, 100);
        }
    }

    onSubmit(): Promise<void> {
        return new Promise((resolve, reject) => {
            const formValue = this.form.value;
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
}