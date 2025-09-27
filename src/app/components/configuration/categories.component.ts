import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { BaseHttp } from '@app/core/base-http';
import { NgIf, NgFor } from '@angular/common';
import { CategoryComponent } from '../category/category.component';

interface Category {
	id: number;
	type: string;
	activities: number;
	students: number;
}

@Component({
	selector: 'app-categories',
	templateUrl: './categories.component.html',
	styleUrls: [],
	imports: [NgIf, NgFor, CategoryComponent]
})
export class CategoriesComponent {
	categories: Category[] = [];
	showCategoryModal: boolean = false;

	categoryId: number = 0;

	private categoryAPI: BaseHttp;

	constructor(private fb: FormBuilder, private http: HttpClient) {
		this.categoryAPI = new BaseHttp('categories', this.http);
	}

	ngOnInit() {
		this.loadCategories();
	}

	loadCategories(): void {
		this.showCategoryModal = false;

		this.categoryAPI.sub('with-counts').get<Category[]>().subscribe(
			(data) => {
				this.categories = data;
			},
			(error) => {
				console.error('Error loading categories:', error);
			}
		);
	}

	deleteCategory(categoryId: number, index: number): void {
		this.categoryAPI.delete<void>(categoryId).subscribe({
			next: () => {
				this.categories = this.categories.filter((cat) => cat.id !== categoryId);
			},
			error: (error) => {
				console.error('Error deleting category:', error);
			}
		});
	}

	editCategory(categoryId: number): void {
		this.categoryId = categoryId;
		this.showCategoryModal = true;
	}
}