// student-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp } from '@app/core/base-http';

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './develop.component.html',
    styleUrls: ['./develop.component.scss']
})
export class DevelopComponent {
    isLoading = false; // Variable para controlar el loading

    ngOnInit() {

    }
    constructor(private http: HttpClient) {

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