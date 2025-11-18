import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { NgIf, NgFor } from '@angular/common';
import { NotificationComponent } from '../notification/notification.component';
import { NotificationRecipientsComponent } from './notification-recipients.component';
import { ModalService } from '@app/core/modal.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Notification {
    id: number;
    type: number;
    categoryId?: number;
    activityId?: number;
    studentId?: number;
    message: string;
    processed: boolean;
    count?: number;
    createdAt: string;
}

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.component.html',
    styleUrls: [],
    imports: [NgIf, NgFor]
})
export class NotificationsComponent implements OnDestroy {
    data: Notification[] = [];

    private api: BaseHttp;
    private destroy$ = new Subject<void>();

    constructor(
        private modalService: ModalService,
        private http: HttpClient,
    ) {
        this.api = new BaseHttp('notifications', this.http);
    }

    ngOnInit() {
        this._fetch();
    }

    _fetch(): void {
        this.api.get<Notification[]>().subscribe((data) => {
            this.data = data.reverse();
        });
    }

    delete(id: number): void {
        if (confirm('¿Estás seguro de eliminar esta notificación?')) {
            this.api.delete<void>(id).subscribe({
                next: () => {
                    this.data = this.data.filter((n) => n.id !== id);
                },
                error: (error) => {
                    console.error('Error deleting:', error);
                }
            });
        }
    }

    edit(id: number, title: string) {
        this.modalService.open({
            component: NotificationComponent, title: title, size: 'md',
            inputs: { notificationId: id },
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

    showRecipients(notificationId: number): void {
        this.modalService.open({
            component: NotificationRecipientsComponent,
            title: 'Destinatarios',
            size: 'md',
            inputs: { notificationId }
        }).pipe(takeUntil(this.destroy$)).subscribe();
    }
}
