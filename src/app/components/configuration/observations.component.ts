import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { NgIf, NgFor } from '@angular/common';
import { ObservationComponent } from '../observation/observation.component';
import { ModalService } from '@app/core/modal.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Observation {
    id: number;
    description: string;
}

@Component({
    selector: 'app-observations',
    templateUrl: './observations.component.html',
    styleUrls: [],
    imports: [NgIf, NgFor]
})
export class ObservationsComponent implements OnDestroy {
    data: Observation[] = [];

    private api: BaseHttp;
    private destroy$ = new Subject<void>();

    constructor(
        private modalService: ModalService,
        private http: HttpClient,
    ) {
        this.api = new BaseHttp('observations', this.http);
    }

    ngOnInit() {
        this._fetch();
    }

    _fetch(): void {
        this.api.get<Observation[]>().subscribe((data) => {
            this.data = data;
        });
    }

    delete(id: number): void {
        if (confirm('¿Estás seguro de eliminar esta observación?')) {
            this.api.delete<void>(id).subscribe({
                next: () => {
                    this.data = this.data.filter((obs) => obs.id !== id);
                },
                error: (error) => {
                    console.error('Error deleting:', error);
                }
            });
        }
    }

    edit(id: number, title: string) {
        this.modalService.open({
            component: ObservationComponent, title: title, size: 'md',
            inputs: { observationId: id },
        }).pipe(takeUntil(this.destroy$)).subscribe((result) => {
            if (result) {
                this._fetch();
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}