import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ValueChangeEvent } from '@angular/forms';
import { filter, take, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { DebugInfoComponent } from "../debug-info/debug-info.component";

@Component({
	selector: 'app-submit',
	templateUrl: './submit.component.html',
	styleUrls: ['./submit.component.scss'],
	standalone: true,
	imports: [CommonModule, DebugInfoComponent]
})
export class SubmitComponent implements OnDestroy {
	@Input() form?: FormGroup;
	@Input() disabled: boolean = false;
	@Input() isModal: boolean = true;
	@Input() submitText: string = 'Guardar';
	@Input() submit!: () => Promise<any>;
	@Output() discard: EventEmitter<void> = new EventEmitter<void>();

	public loading = false;
	private _originalValue: any;
	private destroy$ = new Subject<void>();

	constructor(
		private toastr: ToastrService
	) {

	}

	ngOnInit() {
		this.form?.events.pipe(filter(event => event instanceof ValueChangeEvent), take(1), takeUntil(this.destroy$)).subscribe((event) => {
			this._originalValue = event.value;
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
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
				this._originalValue = this.form?.getRawValue();
				this.form?.markAsPristine();
			} catch (error) {
				console.error(error);
			}
		} finally {
			this.loading = false;
		}
	}
}
