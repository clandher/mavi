// Esquema JSON para tooltips/descripciones en el editor
const GATE_CONTROL_CONFIG_SCHEMA = {
	type: 'object',
	properties: {
		servoPin: {
			type: 'number',
			description: 'Número de pin físico en la placa de control (por ejemplo, Arduino) al que está conectado el cable de señal del servo motor. Usualmente es un número entre 2 y 13. Este valor indica por dónde la placa enviará las señales para mover el servo.'
		},
		servoMin: {
			type: 'number',
			description: 'Duración mínima del pulso (en microsegundos, μs) que el servo acepta para moverse a su posición más baja (por ejemplo, 500). Un valor típico es 500. Si no sabes qué es, déjalo por defecto.'
		},
		servoMax: {
			type: 'number',
			description: 'Duración máxima del pulso (en microsegundos, μs) que el servo acepta para moverse a su posición más alta (por ejemplo, 2500). Un valor típico es 2500. Si no sabes qué es, déjalo por defecto.'
		},
		servoDelay: {
			type: 'number',
			description: 'Tiempo de espera (en milisegundos, ms) entre cada pequeño movimiento del servo cuando se mueve de un ángulo a otro. Un valor bajo hace que el movimiento sea más rápido, uno alto lo hace más suave.'
		},
		checkInterval: {
			type: 'number',
			description: 'Cada cuántos milisegundos (ms) el sistema revisa si debe mover el servo o realizar alguna acción. Un valor típico es 1000 (1 segundo).'
		},
		pulseMin: {
			type: 'number',
			description: 'Valor mínimo de pulso permitido (en microsegundos, μs) para proteger el servo de señales fuera de rango. Normalmente igual a servoMin.'
		},
		pulseMax: {
			type: 'number',
			description: 'Valor máximo de pulso permitido (en microsegundos, μs) para proteger el servo de señales fuera de rango. Normalmente igual a servoMax.'
		},
		initialAngle: {
			type: 'number',
			description: 'Ángulo inicial (en grados) al que se posiciona el servo antes de iniciar el ciclo de movimiento. 0 significa completamente a la izquierda.'
		},
		finalAngle: {
			type: 'number',
			description: 'Ángulo final (en grados) al que se moverá el servo durante el ciclo. 180 significa completamente a la derecha.'
		},
		repetitions: {
			type: 'number',
			description: 'Cuántas veces se repite el ciclo de movimiento completo (de initialAngle a finalAngle y viceversa). Si solo quieres que se mueva una vez, pon 1.'
		},
		repeatDelay: {
			type: 'number',
			description: 'Tiempo de espera (en milisegundos, ms) entre cada repetición del ciclo de movimiento.'
		},
	},
	required: ['servoPin', 'servoMin', 'servoMax', 'servoDelay', 'checkInterval', 'pulseMin', 'pulseMax', 'initialAngle', 'finalAngle', 'repetitions', 'repeatDelay']
};
import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { ToastrService } from 'ngx-toastr';
import { BtnLoadingComponent } from '../btn-loading/btn-loading.component';
import { SchoolService } from '@app/core/school.service';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import JSONEditor from 'jsoneditor';
import { SubmitComponent } from '../submit/submit.component';
import { FormGroupComponent } from "../form-group/form-group.component";
import { GateControlConfig, GateControlConfiguration } from '@app/core/dto';
import { CommonModule } from '@angular/common';
import { MaviValidators } from '@app/core/mavi-validators';


export const DEFAULT_GATE_CONTROL_CONFIG: GateControlConfig = {
	servoPin: 18,
	servoMin: 500,
	servoMax: 2500,
	servoDelay: 20,
	checkInterval: 1000,
	pulseMin: 1000,
	pulseMax: 2000,
	initialAngle: 0,
	finalAngle: 180,
	repetitions: 1,
	repeatDelay: 500,
};

@Component({
	selector: 'app-gate-control-configuration',
	templateUrl: './gate-control-configuration.component.html',
	styleUrls: ['./gate-control-configuration.component.scss'],
	standalone: true,
	imports: [CommonModule, BtnLoadingComponent, FormsModule, ReactiveFormsModule, SubmitComponent, FormGroupComponent],
})
export class GateControlConfigurationComponent implements AfterViewInit, OnInit {

	@ViewChild('jsonEditorContainer', { static: false }) jsonEditorContainer!: ElementRef;
	private jsonEditor!: JSONEditor;

	@ViewChild(SubmitComponent) submitComponent!: SubmitComponent;

	form: FormGroup;
	configurations: GateControlConfiguration[] = [];
	public selectedConfig: GateControlConfiguration | null = null;

	constructor(
		private http: HttpClient,
		private toastr: ToastrService,
		private schoolService: SchoolService,
		private fb: FormBuilder
	) {
		this.form = this.fb.group({
			description: ['', MaviValidators.required()],
			config: ['']
		});
	}

	ngOnInit(): void {
		this._fetch();
	}

	ngAfterViewInit(): void {
		this.jsonEditor = new JSONEditor(this.jsonEditorContainer.nativeElement, {
			onChange: () => {
				try {
					this.form.get('config')?.setValue(this.jsonEditor.get());
					this.form.get('config')?.markAsDirty();
				} catch (error) {
					console.error('Invalid JSON in editor');
				}
			},
			mode: 'form',
			mainMenuBar: false,
			schema: GATE_CONTROL_CONFIG_SCHEMA,
			schemaRefs: undefined
		});
	}

	private _fetch(): void {
		const configAPI = new BaseHttp('gate-control-configurations', this.http);
		configAPI.get().subscribe((response: any) => {
			if (response && response.length > 0) {
				this.configurations = response;
				this.onConfigChange(this.configurations[0]);
			}
		});
	}

	onConfigChange(config: GateControlConfiguration): void {
		this.selectedConfig = config;
		this.form.patchValue(this.selectedConfig);
		this.jsonEditor.set(this.selectedConfig.config);
	}

	async onTest(): Promise<void> {
		if (this.submitComponent) {
			await this.submitComponent.onSubmit();
		}

		const usersAPI = new BaseHttp('gate-control-users', this.http);
		const users = await usersAPI.get<any[]>().toPromise();
		const firstUserId = users && users.length > 0 ? users[0].id : null;
		if (!firstUserId) {
			this.toastr.error('No hay usuarios de control de portón disponibles.');
			return;
		}

		const opsAPI = new BaseHttp('gate-control-operations', this.http);
		await opsAPI.post<any, any>({
			gateControlUserId: Number(firstUserId),
			operation: 'OPEN'
		}).toPromise();

		this.toastr.success('Operación de prueba creada correctamente.', 'Éxito');
	}

	onSubmit(): Promise<void> {
		if (!this.selectedConfig) {
			return Promise.reject('No configuration selected');
		}

		const configAPI = new BaseHttp('gate-control-configurations', this.http);
		return configAPI.patch<any, void>(this.selectedConfig.id!, this.form.value).toPromise();

	}

	onDiscard(): void {

		// console.log('Discarding changes',this.form.get('config')?.value);
		this.jsonEditor.set(this.form.get('config')?.value);
	}

	onDelete() {
		const configAPI = new BaseHttp('gate-control-configurations', this.http);
		configAPI.delete<void>(this.selectedConfig!.id!).toPromise().then(() => {
			this.toastr.success('Configuración eliminada correctamente', 'Éxito');
			this._fetch();
		});
	}

	onResetConfig() {
		this.jsonEditor.set(DEFAULT_GATE_CONTROL_CONFIG);
		this.form.get('config')?.setValue(this.jsonEditor.get());
		this.form.get('config')?.markAsDirty();
	}

	onClone() {
		if (!this.selectedConfig) {
			return;
		}

		const body = {
			description: this.selectedConfig.description + ' 2',
			config: this.selectedConfig.config
		};

		const configAPI = new BaseHttp('gate-control-configurations', this.http);
		configAPI.post<any, GateControlConfiguration>(body).subscribe((result) => {
			this.configurations.push(result);
			this.onConfigChange(result);
			this.toastr.success('Configuración clonada correctamente', 'Éxito');
		});
	}

}