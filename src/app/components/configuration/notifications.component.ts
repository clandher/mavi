import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { NotificationComponent } from '../notification/notification.component';
import { NotificationRecipientsComponent } from './notification-recipients.component';
import { ModalService } from '@app/core/modal.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Activity, Category, Student } from '@app/core/dto';

interface Notification {
    id: number;
    type: number;
    categoryId?: number;
    category: Category;    
    activityId?: number;
    activity?: Activity;
    studentId?: number;
    student?: Student;
    message: string;
    processed: boolean;
    count?: number;
    createdAt: string;
    sent?: number;
    failed?: number;
}

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.component.html',
    styleUrls: [],
    imports: [ CommonModule]
})
export class NotificationsComponent implements OnDestroy {
    data: Notification[] = [];

    getTypeDescription(type: number): string {
        switch (type) {
            case 1: return 'General';
            case 2: return 'Categoría';
            case 3: return 'Actividad';
            case 4: return 'Alumno';
            case 5: return 'Inscripción';
            case 6: return 'Inscripción automática';
            case 7: return 'Recargo';
            case 8: return 'Cargo manual';
            default: return 'Desconocido';
        }
    }

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
        const notification = this.data.find(n => n.id === notificationId);
        let title = 'Destinatarios';
        if (notification) {
            switch (notification.type) {
                case 2:
                    title = `Destinatarios - Categoría: ${notification.category?.type || ''}`;
                    break;
                case 3:
                    title = `Destinatarios - Actividad: ${notification.activity?.description || ''}`;
                    break;
                case 4:
                    title = `Destinatarios - Alumno: ${notification.student?.name || ''}`;
                    break;
                default:
                    title = `Destinatarios - ${this.getTypeDescription(notification.type)}`;
            }
        }
        this.modalService.open({
            component: NotificationRecipientsComponent,
            title,
            size: 'md',
            inputs: { notificationId }
        }).pipe(takeUntil(this.destroy$)).subscribe();
    }
}
