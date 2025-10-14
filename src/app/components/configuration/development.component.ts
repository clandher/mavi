import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { ToastrService } from 'ngx-toastr';
import { BtnLoadingComponent } from '../btn-loading/btn-loading.component';
import { SchoolService } from '@app/core/school.service';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';
import { SubmitComponent } from '../submit/submit.component';
import { FormGroupComponent } from "../form-group/form-group.component";

export interface SeederConfig {
	activityType?: {
		rule?: string
		format?: string
	}
}

export const DEFAULT_SEEDER_CONFIG: SeederConfig = {
	activityType: {
		rule: 'FREQ=MINUTELY;INTERVAL=20',
		format: '(HH:mm)'
	}
};

@Component({
	selector: 'app-development',
	templateUrl: './development.component.html',
	styleUrls: ['./development.component.scss'],
	standalone: true,
	imports: [BtnLoadingComponent, FormsModule, ReactiveFormsModule, SubmitComponent, FormGroupComponent],
})
export class DevelopmentComponent implements AfterViewInit, OnInit {

	@ViewChild('jsonEditorContainer', { static: false }) jsonEditorContainer!: ElementRef;
	private jsonEditor!: JSONEditor;

	@ViewChild(SubmitComponent) submitComponent!: SubmitComponent;

	form: FormGroup;
	private _id: number = 0;

	constructor(
		private http: HttpClient,
		private toastr: ToastrService,
		private schoolService: SchoolService,
		private fb: FormBuilder
	) {
		this.form = this.fb.group({
			seeder: ['']
		});
	}

	ngOnInit(): void {
		this.fetch();
	}

	ngAfterViewInit(): void {
		this.jsonEditor = new JSONEditor(this.jsonEditorContainer.nativeElement, {
			onChange: () => {
				try {
					this.form.get('seeder')?.setValue(this.jsonEditor.get());
					this.form.get('seeder')?.markAsDirty();
				} catch (error) {
					console.error('Invalid JSON in editor');
				}
			},
			mode: 'code',
			mainMenuBar: false,
		});
	}

	private fetch(): void {
		const configAPI = new BaseHttp('configurations', this.http);
		configAPI.get().subscribe((response: any) => {
			if (response && response.length > 0 && response[0].seeder) {
				this.jsonEditor.set(response[0].seeder);
				this.form.get('seeder')?.setValue(response[0].seeder);
				this._id = response[0].id;
			}
		});
	}

	async onRestart(): Promise<void> {
		console.log('form', this.form.value);

		if (this.submitComponent) {
			await this.submitComponent.onSubmit();
		}

		const seederAPI = new BaseHttp('seeder', this.http);
		return seederAPI.post(this.jsonEditor.get()).toPromise().then(() => {
			this.toastr.success('La base de datos ha sido reiniciada y poblada con datos de ejemplo.', 'Operación Exitosa');
			this.schoolService.fetch();
		}).catch(() => {
			console.error('Error reiniciando la base de datos');
		});
	}

	onSubmit(): Promise<void> {
		const configAPI = new BaseHttp('configurations', this.http);
		return configAPI.patch<any, void>(this._id, this.form.value).toPromise();
	}

	onDiscard(): void {
		this.jsonEditor.set(this.form.get('seeder')?.value);
	}

	onResetConfig() {
		this.jsonEditor.set(DEFAULT_SEEDER_CONFIG);
		this.form.get('seeder')?.setValue(this.jsonEditor.get());
		this.form.get('seeder')?.markAsDirty();
	}
}