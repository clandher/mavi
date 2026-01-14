import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { FormGroupComponent } from '../form-group/form-group.component';
import { setFocus } from '@app/core/helpers';
import { ModalInjectable } from '@app/core/modal.service';

@Component({
    selector: 'app-gate-control-operation',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormGroupComponent],
    templateUrl: './gate-control-operation.component.html',
    styleUrls: ['./gate-control-operation.component.scss']
})
export class GateControlOperationComponent implements ModalInjectable {
    disabled: boolean = false;

    @Input() operationId: string = '';
    @Output() complete = new EventEmitter<boolean>();

    public form: FormGroup;
    public users: Array<{ id: string, name: string }> = [];

    constructor(
        private http: HttpClient,
        private fb: FormBuilder,
    ) {
        this.form = this.fb.group({
            gateControlUserId: ['', []],
            date: ['', []],
            operation: ['OPEN', []],
            status: ['PENDING', []]
        });
        this.loadUsers();
    }

    ngAfterViewInit(): void {
        this.loadOperation(this.operationId);
    }

    loadUsers() {
        const usersAPI = new BaseHttp('gate-control-users', this.http);
        usersAPI.get<any[]>().subscribe(result => {
            this.users = result.map(u => ({ id: u.id, name: u.name }));
        });
    }

    loadOperation(id: string) {
        if (id && id !== '0') {
            const opAPI = new BaseHttp(`gate-control-operations/${id}`, this.http);
            opAPI.get<any>().subscribe(result => {
                this.form.patchValue({
                    gateControlUserId: result.gateControlUserId,
                    operation: result.operation,
                });
                setFocus('date');
            });
        } else {
            setTimeout(() => {
                setFocus('date');
            }, 100);
        }
    }

    onSubmit(): Promise<void> {
        return new Promise((resolve, reject) => {
            const opsAPI = new BaseHttp(`gate-control-operations`, this.http);
            const payload = {
                gateControlUserId: Number(this.form.value.gateControlUserId),
                operation: this.form.value.operation
            };
            opsAPI.post<any, any>(payload).subscribe({
                next: () => { this.complete.emit(true); resolve(); },
                error: (err) => { console.error('Error saving operation:', err); reject(err); }
            });
        });
    }
}
