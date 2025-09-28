import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { School } from './dto';
import { buildUrl } from './base-http';
import { ImageHttpClient } from './image-http-client';

@Injectable({ providedIn: 'root' })
export class SchoolService {

    private _schoolSubject = new BehaviorSubject<School | null>(null);
    public changes: Observable<School> = this._schoolSubject.asObservable().pipe(filter((school): school is School => !!school));

    constructor(
        private http: HttpClient,
        private imageHttp: ImageHttpClient) {
        this.fetch();
    }

    public fetch(): void {
        this.http.get<School[]>(buildUrl('schools')).subscribe({
            next: (schools) => {
                const school = schools && schools.length ? schools[0] : { id: 0, description: 'Sorensic' };

                this.imageHttp.school(school).subscribe(blobUrl => {
                    school.logoUrl = blobUrl;
                    this._schoolSubject.next(school);
                });

            },
            error: (err) => {
                console.error('Error loading schools', err);
                this._schoolSubject.next(null);
            }
        });
    }

    get value(): School {
        if (!this._schoolSubject.value) {
            throw new Error('School data not loaded yet');
        }

        return this._schoolSubject.value;
    }
}
