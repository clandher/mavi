import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ValueChangeEvent } from '@angular/forms';
import { filter, take } from 'rxjs';

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

	ngOnInit() {
		this.form?.events.pipe(filter(event => event instanceof ValueChangeEvent), take(1)).subscribe((event) => {
			this._originalValue = event.value;
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
			await this.submit();
			this._originalValue = this.form?.getRawValue();
			this.form?.markAsPristine();
		} finally {
			this.loading = false;
		}
	}
}
