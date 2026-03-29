import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ImageHttpClient } from '@app/core/image-http-client';
import { BaseHttp } from '@app/core/base-http';
import { SchoolService } from '@app/core/school.service';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, FormArray, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SubmitComponent } from '../submit/submit.component';
import { FormGroupComponent } from '../form-group/form-group.component';
import { MaviValidators } from '@app/core/mavi-validators';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
	selector: 'app-schools',
	templateUrl: './schools.component.html',
	styleUrls: ['./schools.component.scss'],
	imports: [NgIf, NgFor, FormsModule, ReactiveFormsModule, SubmitComponent, FormGroupComponent]
})
export class SchoolsComponent implements OnDestroy {

	form: FormGroup;
	private originalLogoUrl = '';
	private destroy$ = new Subject<void>();

	constructor(
		private imageHttp: ImageHttpClient,
		private http: HttpClient,
		private schoolService: SchoolService,
		private fb: FormBuilder
	) {
		this.form = this.fb.group({
			schools: this.fb.array([])
		});
	}

	ngOnInit() {

		this.schoolService.changes.pipe(
			takeUntil(this.destroy$)
		).subscribe(school => {

			this.originalLogoUrl = school.logoUrl ?? '';

			const schoolControls = [school].map((school: any) => {
				return this.fb.group({
					id: [school.id],
					description: [school.description, [MaviValidators.required()]],
					logoUrl: [school.logoUrl],
					pendingLogoFile: this.fb.control<File | null>(null)
				});
			});

			this.form.setControl('schools', this.fb.array(schoolControls));
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	get schoolsArray(): FormArray {
		return this.form.get('schools') as FormArray;
	}

	public onLogoSelected(event: Event, index: number) {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = () => {
			this.schoolsArray.at(index).patchValue({
				logoUrl: reader.result as string,
				pendingLogoFile: file
			});
			this.schoolsArray.markAsDirty();
		};
		reader.readAsDataURL(file);
	}

	public onSaveSchools(): Promise<any> {
		const schoolsAPI = new BaseHttp('schools', this.http);
		const updates = this.schoolsArray.value.map((school: any) => {
			return schoolsAPI.patch(school.id, {
				description: school.description,
			}).toPromise();
		});

		return Promise.all(updates).then(() => {
			this._uploadPendingLogos();
		}).catch((error) => {
			throw error;
		});
	}

	_uploadPendingLogos() {
		this.schoolsArray.controls.forEach((control: AbstractControl) => {
			const school = control.value;
			if (school.pendingLogoFile) {
				this._uploadLogo(school.id, school.pendingLogoFile);
			}
		});
	}

	_uploadLogo(schoolId: number, file: File) {
		const formData = new FormData();
		formData.append('file', file);

		const schoolsAPI = new BaseHttp(`schools/${schoolId}/logo`, this.http);
		schoolsAPI.post<FormData, any>(formData).subscribe({
			next: () => {
				this.schoolService.fetch();
				console.log(`Logo for school ${schoolId} uploaded successfully`);
			},
			error: (err) => {
				console.error('Error uploading logo', err);
			}
		});
	}

	onDiscard() {
		this.schoolsArray.controls.forEach((control: AbstractControl) => {
			control.patchValue({
				logoUrl: this.originalLogoUrl,
				pendingLogoFile: null
			});
		});
		this.form.markAsPristine();
	}
}