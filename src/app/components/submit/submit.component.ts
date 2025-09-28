import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ValueChangeEvent } from '@angular/forms';
import { filter, take } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
	selector: 'app-submit',
	templateUrl: './submit.component.html',
	styleUrls: ['./submit.component.scss'],
	standalone: true,
	imports: [CommonModule]
})
export class SubmitComponent {
	@Input() form?: FormGroup;
	@Input() disabled: boolean = false;
	@Input() isModal: boolean = true;
	@Input() submitText: string = 'Guardar';
	@Input() submit!: () => Promise<any>;
	@Output() discard: EventEmitter<void> = new EventEmitter<void>();

	public loading = false;
	private _originalValue: any;

	constructor(
		private toastr: ToastrService
	) {

	}

	ngOnInit() {
		this.form?.events.pipe(filter(event => event instanceof ValueChangeEvent), take(1)).subscribe((event) => {
			this._originalValue = event.value;
			console.log(this._originalValue);
			this.form?.markAsPristine();
		});
	}

	async onDiscard() {
		this.form?.reset(this._originalValue);
		this.discard.emit();
	}

	async onSubmit() {
		this.loading = true;
		try {
			try {
				await this.submit();
				this.toastr.success('Cambios guardados correctamente', 'Éxito');
			} catch (error) {
				this.toastr.error('Ocurrió un error al guardar los cambios', 'Error');
			}
			
			this._originalValue = this.form?.getRawValue();
			this.form?.markAsPristine();

		} finally {
			this.loading = false;
		}
	}
}
