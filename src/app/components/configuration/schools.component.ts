import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseHttp, buildUrl } from '@app/core/base-http';
import { SchoolService } from '@app/core/school.service';
import { School } from '@app/core/dto';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-schools',
	templateUrl: './schools.component.html',
	styleUrls: ['./schools.component.scss'],
	imports: [NgIf, NgFor, FormsModule]
})
export class SchoolsComponent {
	schools: School[] = [];

	constructor(private http: HttpClient, private schoolService: SchoolService) { }

	ngOnInit() {
		this.getSchools();
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
				console.error('Error fetching schools');
			}
		});
	}

	saveSchool(school: School) {
		const schoolsAPI = new BaseHttp(`schools`, this.http);
		schoolsAPI.patch(school.id!, {
			description: school.description,
		}).subscribe({
			next: () => {
				console.log('School saved successfully');
			},
			error: () => {
				console.error('Error saving school');
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
			next: () => {
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
}