import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { BaseHttp } from '@app/core/base-http';
import { NgIf, NgFor } from '@angular/common';
import { ActivityTypeComponent } from '../activity-type/activity-type.component';

interface ActivityType {
	id: number;
	key: string;
	recurrent: boolean;
	rule?: string;
}

@Component({
	selector: 'app-activity-types',
	templateUrl: './activity-types.component.html',
	styleUrls: [],
	imports: [NgIf, NgFor, ActivityTypeComponent]
})
export class ActivityTypesComponent {
	activityTypes: ActivityType[] = [];
	showActivityTypeModal: boolean = false;

	activityTypeId: number = 0;

	private activityTypeAPI: BaseHttp;

	constructor(private fb: FormBuilder, private http: HttpClient) {
		this.activityTypeAPI = new BaseHttp('activity-types', this.http);
	}

	ngOnInit() {
		this.loadActivityTypes();
	}

	loadActivityTypes(): void {
		this.showActivityTypeModal = false;

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

	editActivityType(activityTypeId: number): void {
		this.activityTypeId = activityTypeId;
		this.showActivityTypeModal = true;
	}
}