import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { StudentPayment } from '@app/core/dto';
import { ModalInjectable } from '@app/core/modal.service';
import { VoucherHelper } from '@app/core/voucher.helper';
import { SchoolService } from '@app/core/school.service';

@Component({
    selector: 'app-voucher',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './voucher.component.html',
    styleUrls: ['./voucher.component.scss']
})
export class VoucherComponent implements ModalInjectable {
    @Input() studentPayment!: StudentPayment;
    @Output() complete = new EventEmitter<boolean>();

    public submitText?: string = 'Descargar voucher';
    public form: FormGroup = new FormGroup({});
    public disabled: boolean = false;


    constructor(
        private schoolService: SchoolService,
    ) {
        this.form.markAsDirty();
    }

    ngAfterViewInit(): void {
        setTimeout(async () => {
            const canvas = await VoucherHelper.buildVoucherCanvas(this.studentPayment, this.schoolService.value);
            const container = document.getElementById('voucher-preview-canvas');
            if (container) {
                container.innerHTML = '';
                container.appendChild(canvas);
            }
        }, 0);
    }

    async onSubmit(): Promise<void> {
        await VoucherHelper.download(this.studentPayment, this.schoolService.value);
    }
}