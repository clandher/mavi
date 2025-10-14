import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { NgIf, NgFor } from '@angular/common';
import { CategoryComponent } from '../category/category.component';
import { ModalService } from '@app/core/modal.service';

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
	imports: [NgIf, NgFor]
})
export class CategoriesComponent {
	categories: Category[] = [];

	private categoryAPI: BaseHttp;

	constructor(
		private modalService: ModalService,
		private http: HttpClient,
	) {
		this.categoryAPI = new BaseHttp('categories', this.http);
	}

	ngOnInit() {
		this.loadCategories();
	}

	loadCategories(): void {
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

	showModal(categoryId: number, title: string) {
		this.modalService.open({
			component: CategoryComponent, title: title, size: 'md',
			inputs: { categoryId: categoryId },
		}).subscribe((result) => {
			if (result) {
				this.loadCategories();
			}
		});
	}
}