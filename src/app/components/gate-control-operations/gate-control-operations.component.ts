import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { ModalService } from '@app/core/modal.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GateControlOperationComponent } from './gate-control-operation.component';
import { NgIf, NgFor, CommonModule } from '@angular/common';

interface GateControlOperation {
  id: string;
  gateControlUserId: number;
  date: string;
  operation: 'OPEN' | 'CLOSE';
  status: 'PENDING' | 'SENT' | 'COMPLETED';
  gateControlUser?: { name: string };
}

@Component({
  selector: 'app-gate-control-operations',
  templateUrl: './gate-control-operations.component.html',
  styleUrls: ['./gate-control-operations.component.scss'],
  imports: [NgIf, NgFor, CommonModule],
})
export class GateControlOperationsComponent implements OnInit, OnDestroy {

  operations: GateControlOperation[] = [];
  private operationAPI: BaseHttp;
  private destroy$ = new Subject<void>();

  constructor(
    private modalService: ModalService,
    private http: HttpClient,
  ) {
    this.operationAPI = new BaseHttp('gate-control-operations', this.http);
  }

  ngOnInit() {
    this.loadOperations();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOperations(): void {
    this.operationAPI.get<GateControlOperation[]>().pipe(takeUntil(this.destroy$)).subscribe(
      (data) => {
        this.operations = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },
      (error) => {
        console.error('Error loading operations:', error);
      }
    );
  }

  deleteOperation(operationId: string, index: number): void {
    this.operationAPI.delete<void>(operationId).subscribe({
      next: () => {
        this.operations = this.operations.filter((o) => o.id !== operationId);
      },
      error: (error) => {
        console.error('Error deleting operation:', error);
      }
    });
  }

  complete(operationId: string): void {
    this.operationAPI.patch(operationId, { status: 'COMPLETED' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadOperations();
        },
        error: (error) => {
          console.error('Error updating operation status:', error);
        }
      });
  }

  retry(operationId: string) {
    this.operationAPI.patch(operationId, { status: 'PENDING' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadOperations();
        },
        error: (error) => {
          console.error('Error updating operation status:', error);
        }
      });
  }

  showModal(operationId: string, title: string): void {
    this.modalService.open({
      component: GateControlOperationComponent, title,
      inputs: { operationId, },
    }).pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        this.loadOperations();
      }
    });
  }
}
