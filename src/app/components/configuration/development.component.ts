import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { ToastrService } from 'ngx-toastr';
import { BtnLoadingComponent } from '../btn-loading/btn-loading.component';
import { SchoolService } from '@app/core/school.service';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import JSONEditor from 'jsoneditor';
import { SubmitComponent } from '../submit/submit.component';
import { FormGroupComponent } from "../form-group/form-group.component";
import { LinkHelpComponent } from "../link-help/link-help.component";
import { LocalStorage } from '@app/core/local-storage';
import { Configuration, SeederConfig } from '@app/core/dto';
import { CommonModule } from '@angular/common';
import { MaviValidators } from '@app/core/mavi-validators';


export const DEFAULT_SEEDER_CONFIG: SeederConfig = {
	activityType: {
		rule: 'FREQ=MINUTELY;INTERVAL=20',
		format: '(HH:mm)',
		surchargeAmount: 100,
	},
	student: {
		seed: 3076,
		quantity: 30,
	},
	activity: {
		duration: '10m',
		gracePeriod: '3m',
		price: {
			min: 300,
			max: 600,
		}
	},
	school: {
		name: 'Sorensic',
	}
};

@Component({
	selector: 'app-development',
	templateUrl: './development.component.html',
	styleUrls: ['./development.component.scss'],
	standalone: true,
	imports: [CommonModule, BtnLoadingComponent, FormsModule, ReactiveFormsModule, SubmitComponent, FormGroupComponent, LinkHelpComponent],
})
export class DevelopmentComponent implements AfterViewInit, OnInit {


	public debug = new LocalStorage<boolean>('debug', true);

	@ViewChild('jsonEditorContainer', { static: false }) jsonEditorContainer!: ElementRef;
	private jsonEditor!: JSONEditor;

	@ViewChild(SubmitComponent) submitComponent!: SubmitComponent;

	form: FormGroup;
	configurations: Configuration[] = [];
	public selectedConfig: Configuration | null = null;

	constructor(
		private http: HttpClient,
		private toastr: ToastrService,
		private schoolService: SchoolService,
		private fb: FormBuilder
	) {
		this.form = this.fb.group({
			description: ['', MaviValidators.required()],
			seeder: ['']
		});
	}

	ngOnInit(): void {
		this._fetch();
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

	private _fetch(): void {
		const configAPI = new BaseHttp('configurations', this.http);
		configAPI.get().subscribe((response: any) => {
			if (response && response.length > 0) {
				this.configurations = response;
				this.onConfigChange(this.configurations[0]);
			}
		});
	}

	onConfigChange(config: Configuration): void {
		this.selectedConfig = config;
		this.form.patchValue(this.selectedConfig);
		this.jsonEditor.set(this.selectedConfig.seeder);
	}

	async onRestart(): Promise<void> {
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
		if (!this.selectedConfig) {
			return Promise.reject('No configuration selected');
		}

		const configAPI = new BaseHttp('configurations', this.http);
		return configAPI.patch<any, void>(this.selectedConfig.id!, this.form.value).toPromise();

	}

	onDiscard(): void {

		// console.log('Discarding changes',this.form.get('seeder')?.value);
		this.jsonEditor.set(this.form.get('seeder')?.value);
	}

	onDelete() {
		const configAPI = new BaseHttp('configurations', this.http);
		configAPI.delete<void>(this.selectedConfig!.id!).toPromise().then(() => {
			this.toastr.success('Configuración eliminada correctamente', 'Éxito');
			this._fetch();
		});
	}

	onResetConfig() {
		this.jsonEditor.set(DEFAULT_SEEDER_CONFIG);
		this.form.get('seeder')?.setValue(this.jsonEditor.get());
		this.form.get('seeder')?.markAsDirty();
	}

	onClone() {
		if (!this.selectedConfig) {
			return;
		}

		const body = {
			description: this.selectedConfig.description + ' 2',
			seeder: this.selectedConfig.seeder
		};
		
		const configAPI = new BaseHttp('configurations', this.http);
		configAPI.post<any, Configuration>(body).subscribe((result) => {
			this.configurations.push(result);
			this.onConfigChange(result);
			this.toastr.success('Configuración clonada correctamente', 'Éxito');
		});
	}

}