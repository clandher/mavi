import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { School } from './dto';
import { buildUrl } from './base-http';

@Injectable({ providedIn: 'root' })
export class SchoolService {
    private schoolSubject = new BehaviorSubject<School | null>(null);
    school$ = this.schoolSubject.asObservable();

    constructor(private http: HttpClient) {
        this.loadSchools();
    }

    loadSchools(): void {
        this.http.get<School[]>(buildUrl('schools')).subscribe({
            next: (schools) => {
                const school = schools && schools.length ? schools[0] : { id: 0, description: 'Sorensic' };
                if (school.logo) {
                    school.logoUrl = buildUrl(`schools/${school.id}/logo`) + `?t=${new Date().getTime()}`;
                }

                this.schoolSubject.next(school);
            },
            error: (err) => {
                console.error('Error loading schools', err);
                this.schoolSubject.next(null);
            }
        });
    }

    get school(): School {
        if (!this.schoolSubject.value) {
            throw new Error('School data not loaded yet');
        }

        return this.schoolSubject.value;
    }

    getSchoolName(): string {
        const school = this.school;
        return school ? school.description : '';
    }
}
