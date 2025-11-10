import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { BaseHttp } from '@app/core/base-http';
import { NgIf, NgFor } from '@angular/common';
import { DiscountTypeComponent } from '../discount-type/discount-type.component';
import { DiscountType } from '@app/core/dto';
import { ModalService } from '@app/core/modal.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CurrencyMXPipe } from "../../core/currency-mx.pipe";

@Component({
	selector: 'app-discount-types',
	templateUrl: './discount-types.component.html',
	styleUrls: [],
	imports: [NgIf, NgFor, CurrencyMXPipe]
})
export class DiscountTypesComponent implements OnDestroy {

	discountTypes: DiscountType[] = [];


	private discountTypeAPI: BaseHttp;
	private destroy$ = new Subject<void>();

	constructor(
		private modalService: ModalService,
		private http: HttpClient
	) {
		this.discountTypeAPI = new BaseHttp('discount-types', this.http);
	}

	ngOnInit() {
		this.loadDiscountTypes();
	}

	loadDiscountTypes(): void {

		this.discountTypeAPI.get<DiscountType[]>().subscribe(
			(data) => {
				this.discountTypes = data;
			},
			(error) => {
				console.error('Error loading discount types:', error);
			}
		);
	}

	deleteDiscountType(discountTypeId: number): void {
		this.discountTypeAPI.delete<void>(discountTypeId).subscribe({
			next: () => {
				this.discountTypes = this.discountTypes.filter((type) => type.id !== discountTypeId);
			},
			error: (error) => {
				console.error('Error deleting discount type:', error);
			}
		});
	}

	showModal(discountTypeId: number, title: string) {
		this.modalService.open({
			component: DiscountTypeComponent, title: title, size: 'md',
			inputs: { discountTypeId: discountTypeId },
		}).pipe(takeUntil(this.destroy$)).subscribe((result) => {
			if (result) {
				this.loadDiscountTypes();
			}
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}