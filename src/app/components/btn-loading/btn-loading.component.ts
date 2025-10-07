import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'btn-loading',
    template: `
    <button [disabled]="loading || disabled" class="btn btn-primary flex items-center justify-content-center" [ngClass]="class" (click)="onClick()">
      	<span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
		{{ text }}
    </button>
  `,
    standalone: true,
    imports: [CommonModule]
})
export class BtnLoadingComponent {
    @Input() disabled: boolean = false;
    @Input() text: string = 'Enviar';
    @Input() class: string | undefined;
    @Input() action!: () => Promise<void>;

    public loading: boolean = false;

    async onClick() {
        if (!this.loading && !this.disabled && this.action) {
            this.loading = true;
            await this.action();
            this.loading = false;
        }
    }
}