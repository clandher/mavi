import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { BaseHttp } from '@app/core/base-http';
import { NgIf, NgFor } from '@angular/common';
import { ActivityTypeComponent } from '../activity-type/activity-type.component';
import { ActivityType } from '@app/core/dto';
import { ModalService } from '@app/core/modal.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-activity-types',
	templateUrl: './activity-types.component.html',
	styleUrls: [],
	imports: [NgIf, NgFor]
})
export class ActivityTypesComponent implements OnDestroy {

	activityTypes: ActivityType[] = [];


	private activityTypeAPI: BaseHttp;
	private destroy$ = new Subject<void>();

	constructor(
		private modalService: ModalService,
		private http: HttpClient
	) {
		this.activityTypeAPI = new BaseHttp('activity-types', this.http);
	}

	ngOnInit() {
		this.loadActivityTypes();
	}

	loadActivityTypes(): void {

		this.activityTypeAPI.get<ActivityType[]>().subscribe(
			(data) => {
				this.activityTypes = data;
			},
			(error) => {
				console.error('Error loading activity types:', error);
			}
		);
	}

	deleteActivityType(activityTypeId: number): void {
		this.activityTypeAPI.delete<void>(activityTypeId).subscribe({
			next: () => {
				this.activityTypes = this.activityTypes.filter((type) => type.id !== activityTypeId);
			},
			error: (error) => {
				console.error('Error deleting activity type:', error);
			}
		});
	}

	showModal(activityTypeId: number, title: string) {
		this.modalService.open({
			component: ActivityTypeComponent, title: title, size: 'md',
			inputs: { activityTypeId: activityTypeId },
		}).pipe(takeUntil(this.destroy$)).subscribe((result) => {
			if (result) {
				this.loadActivityTypes();
			}
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}