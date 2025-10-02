import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';
import { NgIf, NgFor } from '@angular/common';
import { User } from '@app/core/dto';
import { UserComponent } from '../user/user.component';
import { UserPasswordComponent } from '../user-password/user-password.component';
import { AuthService } from '@app/core/auth.service';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
    imports: [NgIf, NgFor, UserComponent, UserPasswordComponent]
})
export class UsersComponent implements OnInit {

    users: User[] = [];
    showUserModal: boolean = false;
    showPasswordModal: boolean = false;

    userId: number = 0;

    private userAPI: BaseHttp;

    constructor(
        private http: HttpClient,
        private authService: AuthService,
    ) {
        this.userAPI = new BaseHttp('users', this.http);
    }

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers(): void {


        this.showUserModal = false;

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

    onNewUser() {
        this.userId = 0;
        this.showUserModal = true;
    }

    editUser(userId: number): void {
        this.userId = userId;
        this.showUserModal = true;
    }

    openPasswordModal(userId: number): void {
        this.userId = userId;
        this.showPasswordModal = true;
    }

    onPasswordModalComplete(success: boolean): void {
        this.showPasswordModal = false;
        this.userId = 0;
    }
}