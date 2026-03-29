import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BaseHttp, buildUrl } from '@app/core/base-http';
import { ModalInjectable } from '@app/core/modal.service';
import { RequestQueryBuilder } from '@dataui/crud-request';
import { FormsModule } from "@angular/forms";
import { NotificationType } from '@app/core/dto';

export enum NotificationRecipientStatus {
    PENDING = 0,
    SENT = 1,
    ERROR = 2,
}

@Component({
    selector: 'app-notification-configuration',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './notification-configuration.component.html'
})
export class NotificationConfigurationComponent implements ModalInjectable {
    @Input() studentId: number = 0;

    @Output() complete = new EventEmitter<boolean>();

    recipients: Array<any> = [];
    completedRecipients: Array<any> = [];
    failedRecipients: Array<any> = [];
    loading = true;
    disabled = false;
    form: any = null;

    // Preferencias de notificación en memoria
    notificationPreferences: { [key: number]: boolean } = {};

    notificationTypes = [
        { key: NotificationType.GENERAL, label: 'General', description: 'Notificaciones generales.' },
        { key: NotificationType.CATEGORY, label: 'Categoría', description: 'Avisos relacionados con la categoría del estudiante.' },
        { key: NotificationType.ACTIVITY, label: 'Actividad', description: 'Te avisaremos sobre actividades del estudiante.' },
        { key: NotificationType.STUDENT, label: 'Estudiante', description: 'Notificaciones individuales para el estudiante.' },
        { key: NotificationType.INSCRIPTION, label: 'Inscripción', description: 'Recibirás avisos cuando se te inscriba a alguna actividad.' },
        { key: NotificationType.AUTOMATIC_INSCRIPTION, label: 'Inscripción automática', description: 'Avisos de inscripciones automáticas.' },
        { key: NotificationType.SURRCHARGE, label: 'Recargo', description: 'Te notificaremos sobre recargos aplicados.' },
        { key: NotificationType.MANUAL_CHARGE, label: 'Cargo manual', description: 'Avisos de cargos manuales realizados.' },
        { key: NotificationType.UNSUBSCRIBE, label: 'Baja', description: 'Te avisaremos cuando te demos de baja de alguna actividad.' },
        { key: NotificationType.PAYMENT, label: 'Pago', description: 'Te avisaremos sobre tus pagos realizados.' },
        { key: NotificationType.DISCOUNT, label: 'Descuento', description: 'Recibirás avisos de descuentos aplicados.' },
    ];

    constructor(private http: HttpClient) { }


    ngAfterViewInit(): void {

        this.http.get<{ notifications: NotificationType[] }>(buildUrl(`students/${this.studentId}`)).subscribe(student => {
            this.notificationTypes.forEach(nt => {
                this.notificationPreferences[nt.key] = student.notifications.includes(nt.key);
            });
        });
    }

    onSubmit(): Promise<void> {
        const notifications = Object.keys(this.notificationPreferences)
            .filter(key => this.notificationPreferences[Number(key)])
            .map(key => Number(key));

        // Ajusta la URL según el endpoint correcto
        return this.http.patch(buildUrl(`students/${this.studentId}`), { notifications }).toPromise()
            .then(() => {
                this.complete.emit(true);
            });
    }

    onToggle(type: number): void {
        this.notificationPreferences[type] = !this.notificationPreferences[type];
    }

}
