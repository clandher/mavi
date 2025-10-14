import { Component, Input } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';

@Component({
    selector: 'btn-loading',
    templateUrl: './btn-loading.component.html',
    standalone: true,
    imports: [CommonModule, NgIf]
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