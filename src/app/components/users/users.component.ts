import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { NgIf, NgFor } from '@angular/common';
import { User } from '@app/core/dto';
import { UserComponent } from '../user/user.component';
import { UserPasswordComponent } from '../user-password/user-password.component';
import { AuthService } from '@app/core/auth.service';
import { ModalService } from '@app/core/modal.service';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
    imports: [NgIf, NgFor]
})
export class UsersComponent implements OnInit {

    users: User[] = [];

    userId: number = 0

    private userAPI: BaseHttp;

    constructor(
        private modalService: ModalService,
        private http: HttpClient,
        private authService: AuthService,
    ) {
        this.userAPI = new BaseHttp('users', this.http);
    }

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers(): void {

        this.userAPI.get<User[]>().subscribe(
            (data) => {
                this.users = data;
                console.log('Users loaded:', this.userId, this.authService.user?.id);
                if (this.userId === this.authService.user?.id) {

                    const foundUser = this.users.find(u => u.id === this.userId) || null;
                    if (foundUser) {
                        this.authService.setUserData(foundUser);
                    }
                }
            },
            (error) => {
                console.error('Error loading users:', error);
            }
        );
    }

    deleteUser(userId: number): void {
        this.userAPI.delete<void>(userId).subscribe({
            next: () => {
                this.users = this.users.filter((user) => user.id !== userId);
            },
            error: (error) => {
                console.error('Error deleting user:', error);
            }
        });
    }

    showModalUser(userId: number, title: string): void {
        this.modalService.open({
            component: UserComponent, title: title, size: 'md',
            inputs: { userId: userId },
        }).subscribe((result) => {
            if (result) {
                this.loadUsers();
            }
        });
    }

    showModalPassword(userId: number, title: string): void {
        this.modalService.open({
            component: UserPasswordComponent, title: title, size: 'md',
            inputs: { userId: userId },
        }).subscribe((result) => {
            this.userId = 0;
        });
    }

}