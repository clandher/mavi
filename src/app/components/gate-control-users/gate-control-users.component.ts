import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { ModalService } from '@app/core/modal.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GateControlUserComponent } from './gate-control-user.component';
import { NgIf, NgFor } from '@angular/common';

interface GateControlUser {
    id: string;
    phone: string;
    name: string;
    active: boolean;
}

@Component({
    selector: 'app-gate-control-users',
    templateUrl: './gate-control-users.component.html',
    imports: [NgIf, NgFor],
    styleUrls: ['./gate-control-users.component.scss']
})
export class GateControlUsersComponent implements OnInit, OnDestroy {
    users: GateControlUser[] = [];
    private userAPI: BaseHttp;
    private destroy$ = new Subject<void>();

    constructor(
        private modalService: ModalService,
        private http: HttpClient,
    ) {
        this.userAPI = new BaseHttp('gate-control-users', this.http);
    }

    ngOnInit() {
        this.loadUsers();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadUsers(): void {
        this.userAPI.get<GateControlUser[]>().pipe(takeUntil(this.destroy$)).subscribe(
            (data) => {
                this.users = data;
            },
            (error) => {
                console.error('Error loading users:', error);
            }
        );
    }

    deleteUser(userId: string, index: number): void {
        this.userAPI.delete<void>(userId).subscribe({
            next: () => {
                this.users = this.users.filter((u) => u.id !== userId);
            },
            error: (error) => {
                console.error('Error deleting user:', error);
            }
        });
    }

    showModal(userId: string, title: string): void {
        this.modalService.open({
            component: GateControlUserComponent, title,
            inputs: { userId },
        }).pipe(takeUntil(this.destroy$)).subscribe((result) => {
            if (result) {
                this.loadUsers();
            }
        });
    }
}
