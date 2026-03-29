import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { ModalInjectable } from '@app/core/modal.service';
import { RequestQueryBuilder } from '@dataui/crud-request';

export enum NotificationRecipientStatus {
  PENDING = 0,
  SENT = 1,
  ERROR = 2,
}

@Component({
    selector: 'app-notification-recipients',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './notification-recipients.component.html'
})
export class NotificationRecipientsComponent implements ModalInjectable {
    @Input() notificationId: number = 0;
    @Output() complete = new EventEmitter<boolean>();

    recipients: Array<any> = [];
    completedRecipients: Array<any> = [];
    failedRecipients: Array<any> = [];
    loading = true;
    disabled = false;
    form: any = null;

    constructor(private http: HttpClient) { }

    ngAfterViewInit(): void {
        if (this.notificationId) {
            const queryString = RequestQueryBuilder.create({
                search: { notificationId: Number(this.notificationId) },
            }).query();

            const api = new BaseHttp(`notification-recipients?${queryString}`, this.http);
            api.get<Array<any>>().subscribe({
                next: (recipients) => {
                    this.recipients = recipients;
                    this.completedRecipients = recipients.filter(r => r.status === NotificationRecipientStatus.SENT);
                    this.failedRecipients = recipients.filter(r => r.status === NotificationRecipientStatus.ERROR);
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                }
            });
        } else {
            this.loading = false;
        }
    }

    radarsKeys(obj: any): string[] {
        return obj ? Object.keys(obj) : [];
    }

    onSubmit(): Promise<void> {
        this.complete.emit(true);
        return Promise.resolve();
    }
}
