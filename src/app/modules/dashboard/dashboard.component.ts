// dashboard.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { SchoolService } from '../../core/school.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { School } from '@app/core/dto';

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
    menuOpen = false;

    public school: School | null = null;

    constructor(
        public authService: AuthService,
        public schoolService: SchoolService
    ) {
        this.schoolService.changes.subscribe(school => {
            this.school = school;
        });
    }

    toggleMenu(): void {
        this.menuOpen = !this.menuOpen;
    }

    logout(): void {
        this.authService.logout();
        this.menuOpen = false;
    }


    getInitials(name: string): string {
        return name.split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase();
    }
}