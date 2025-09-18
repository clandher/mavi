import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';

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
	@Input() submitText: string = 'Guardar';
	@Input() submit!: () => Promise<any>;
	@Output() discard: EventEmitter<void> = new EventEmitter<void>();

	public loading = false;

	async onDiscard() {
		this.form?.reset();
		this.discard.emit();
	}

	async onSubmit() {
		if (this.loading || this.disabled || (this.form && this.form.invalid)) {
			return;
		}

		this.loading = true;
		try {
			await this.submit();
		} finally {
			this.loading = false;
		}
	}
}
