import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseHttp, buildUrl } from '@app/core/base-http';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { NotificationComponent } from '../notification/notification.component';
import { NotificationRecipientsComponent } from './notification-recipients.component';
import { ModalService } from '@app/core/modal.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Activity, Category, NotificationRecipient, Student } from '@app/core/dto';
import { RequestQueryBuilder } from '@dataui/crud-request';
import { ActivatedRoute } from '@angular/router';
import { BtnLoadingComponent } from "../btn-loading/btn-loading.component";
import { NotificationConfigurationComponent } from './notification-configuration.component';
import { StudentService } from '@app/core/student.service';



@Component({
    selector: 'app-notification-recipient',
    templateUrl: './notification-recipient.component.html',
    styleUrls: [],
    imports: [CommonModule, BtnLoadingComponent]
})
export class NotificationRecipientComponent implements OnDestroy {
    data: NotificationRecipient[] = [];

    getTypeDescription(type: number): string {
        switch (type) {
            case 1: return 'General';
            case 2: return 'Categoría';
            case 3: return 'Actividad';
            case 4: return 'Estudiante';
            case 5: return 'Inscripción';
            case 6: return 'Inscripción automática';
            case 7: return 'Recargo';
            case 8: return 'Cargo manual';
            case 9: return 'Baja';
            case 10: return 'Pago';
            case 11: return 'Descuento';
            default: return 'Desconocido';
        }
    }

    private api: BaseHttp;
    private destroy$ = new Subject<void>();
    studentId: number | null = null;
    student: Student | undefined = undefined;

    constructor(
        private modalService: ModalService,
        private http: HttpClient,
        private route: ActivatedRoute,
        private studentService: StudentService
    ) {


        this.api = new BaseHttp('notification-recipients', this.http);

        this.studentService.student().subscribe((student) => {
            this.student = student;
        });
    }

    ngOnInit() {
        this._fetch();
    }

    async _fetch(): Promise<void> {


        this.studentId = Number(this.route.parent!.snapshot.paramMap.get('id'));
        const queryString = RequestQueryBuilder.create({
            search: { studentId: this.studentId },
        }).query();

        this.data = (await this.http.get<NotificationRecipient[]>(buildUrl(`notification-recipients?${queryString}`)).toPromise()) || [];
        this.data = this.data.reverse();


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
        // this.modalService.open({
        //     component: NotificationComponent, title: title, size: 'md',
        //     inputs: { notificationId: id },
        // }).pipe(takeUntil(this.destroy$)).subscribe((result) => {
        //     if (result) {
        //         this._fetch();
        //     }
        // });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    showConfigurations(): void {
        this.modalService.open({
            component: NotificationConfigurationComponent,
            inputs: { studentId: this.studentId },
            title: 'Configurar notificaciones',
            size: 'md'
        }).pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.studentService.refreshNotifier
        });

    }
}
