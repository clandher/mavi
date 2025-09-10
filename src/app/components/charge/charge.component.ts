import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { CreateChargeDto } from '@app/core/dto';

@Component({
    selector: 'app-charge',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './charge.component.html',
    styleUrls: ['./charge.component.scss']
})
export class ChargeComponent {
    @Input() studentActivityId: number | null = null;
    @Output() complete = new EventEmitter<boolean>();
    public newCharge: CreateChargeDto = {
        studentActivityId: 0,
        amountToBePaid: 0,
        concept: ''
    };

    constructor(private http: HttpClient) { }

    ngOnChanges() {
        if (this.studentActivityId) {
            this.newCharge.studentActivityId = this.studentActivityId;
        }
    }

    closeModal(): void {
        this.complete.emit(false);
    }

    saveCharge(): void {
        const validationResult = this.validateCharge();
        if (validationResult === true) {
            const chargeAPI = new BaseHttp('chargers', this.http);
            chargeAPI.post<CreateChargeDto, any>(this.newCharge).subscribe({
                next: () => this.complete.emit(true),
                error: (err) => console.error('Error al crear el cobro:', err)
            });
        } else {
            alert(validationResult);
        }
    }

    validateCharge(): true | string {
        if (!this.newCharge.studentActivityId || this.newCharge.studentActivityId <= 0) {
            return 'Debe seleccionar una actividad válida.';
        }
        if (!this.newCharge.amountToBePaid || this.newCharge.amountToBePaid <= 0) {
            return 'El monto debe ser mayor a 0.';
        }
        if (!this.newCharge.concept || this.newCharge.concept.trim() === '') {
            return 'El concepto es obligatorio.';
        }
        return true;
    }
}
