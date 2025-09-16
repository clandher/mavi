// student-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp, buildUrl } from '@app/core/base-http';
import { CreateSchoolDto, School } from '@app/core/dto';
import { SchoolService } from '@app/core/school.service';

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './develop.component.html',
    styleUrls: ['./develop.component.scss']
})
export class DevelopComponent {
    isLoading = false; // Variable para controlar el loading

    schools: School[] = [];
    selectedSchoolTab: string = 'schools';

    constructor(
        private http: HttpClient,
        private schoolService: SchoolService
    ) { }

    ngOnInit() {
        this.getSchools();
    }

    getSchools() {
        const schoolsAPI = new BaseHttp('schools', this.http);
        schoolsAPI.get().subscribe({
            next: (data: any) => {
                this.schools = data.map((school: any) => {
                    if (school.logo) {
                        school.logoUrl = buildUrl(`schools/${school.id}/logo`) + `?t=${new Date().getTime()}`;
                    }
                    return school;
                });
            },
            error: () => {
                // Manejo de error si lo deseas
            }
        });
    }

    saveSchool(school: School) {
        const schoolsAPI = new BaseHttp(`schools/${school.id}`, this.http);
        schoolsAPI.patch({
            description: school.description,
        }).subscribe({
            next: () => {
                // Actualización exitosa
            },
            error: () => {
                // Manejo de error si lo deseas
            }
        });
    }

    onLogoSelected(event: Event, school: School) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file || !school.id) return;

        const formData = new FormData();
        formData.append('file', file);

        const schoolsAPI = new BaseHttp(`schools/${school.id}/logo`, this.http);
        schoolsAPI.post<FormData, any>(formData).subscribe({
            next: (res) => {
                const timestamp = new Date().getTime();
                school.logoUrl = buildUrl(`schools/${school.id}/logo`) + `?t=${timestamp}`;
                this.schoolService.fetch();
            },
            error: (err) => {
                console.error('Error uploading logo', err);
            }
        });

        const reader = new FileReader();
        reader.onload = () => {
            school.logo = reader.result as string;
        };
        reader.readAsDataURL(file);

    }



    onRestart() {
        this.isLoading = true;
        const seederAPI = new BaseHttp('seeder', this.http,)
        seederAPI.post({}).subscribe({
            next: () => {
                console.log('Seeding completed');
            },
            error: () => {
                // Manejo de error si lo deseas
            },
            complete: () => {
                this.isLoading = false;
            }
        });
    }

}