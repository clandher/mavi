import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl, Validators } from '@angular/forms';

@Component({
	selector: 'app-form-group',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './form-group.component.html',
	styleUrls: ['./form-group.component.scss']
})
export class FormGroupComponent {
	@Input() title!: string;
	@Input() for: string | undefined;
	@Input() control!: AbstractControl | null;

	public required = false


	ngOnInit(): void {
		if (this.control) {
			this.required = this.control.validator?.({} as AbstractControl)?.['required'] !== undefined;
		}
	}
}
