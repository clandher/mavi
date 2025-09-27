// dashboard.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { SchoolService } from '../../core/school.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { School } from '@app/core/dto';
import { ImageHttpClient } from '../../core/image-http-client';
import { DomSanitizer } from '@angular/platform-browser';
import { BaseHttp } from '../../core/base-http'; // Add this import
import { HttpClient } from '@angular/common/http';

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
        private sanitizer: DomSanitizer,
        private http: HttpClient,
    ) {
        this.schoolService.changes.subscribe(school => {
            this.school = school;
            this.logoUrl = school?.logoUrl || null;
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

    onLogoSelected(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            this.logoUrl = this.sanitizer.bypassSecurityTrustUrl(reader.result as string) as string;
        };
        reader.readAsDataURL(file);


        const formData = new FormData();
        formData.append('file', file);

        const schoolsAPI = new BaseHttp(`schools/${this.schoolService.value.id}/logo`, this.http);
        schoolsAPI.post<FormData, any>(formData).subscribe({
            next: () => {
                this.schoolService.fetch();
                console.log(`Logo for school ${this.schoolService.value.id} uploaded successfully`);
            },
            error: (err) => {
                console.error('Error uploading logo', err);
            }
        });
    }
}