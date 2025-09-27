// dashboard.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { SchoolService } from '../../core/school.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { School } from '@app/core/dto';
import { ImageHttpClient } from '../../core/image-http-client';

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {
    menuOpen = false;

    public school: School | null = null;
    public logoUrl: string | null = null;

    constructor(
        public authService: AuthService,
        public schoolService: SchoolService,
        private imageHttp: ImageHttpClient
    ) {
        this.schoolService.changes.subscribe(school => {
            this.school = school;
            if (school?.logoUrl) {
                this.imageHttp.fetch(school.logoUrl).subscribe(blobUrl => {
                    this.logoUrl = blobUrl;
                });
            }
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