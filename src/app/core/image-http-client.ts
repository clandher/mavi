import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { buildUrl } from './base-http';
import { School, Student } from './dto';

@Injectable({
    providedIn: 'root',
})
export class ImageHttpClient {

    private cache = new Map<string, string>(); // Cache para almacenar las URLs de los blobs

    constructor(
        public authService: AuthService,
        private http: HttpClient
    ) { }


    school(school: School): Observable<string> {
        if (school.logo) {
            const fetcher = this.fetch(`schools/${school.id}/logo`).pipe(
                map(photoUrl => {
                    school.logoUrl = photoUrl ?? '';
                    return school.logoUrl;
                })
            );
            fetcher.subscribe();
            return fetcher;
        }

        return new Observable(observer => {
            observer.next(school.logoUrl ?? '');
            observer.complete();
        });
    }

    student(student: Student): Observable<string> {
        if (student.photo) {
            const fetcher = this.fetch(`students/${student.id}/photo`).pipe(
                map(photoUrl => {
                    student.photoUrl = photoUrl ?? '';
                    return student.photoUrl;
                })
            );
            // Ejecuta el fetch automáticamente
            fetcher.subscribe();
            return fetcher;
        }

        return new Observable(observer => {
            observer.next(student.photoUrl ?? '');
            observer.complete();
        });
    }

    fetch(url: string): Observable<string> {
        if (this.cache.has(url)) {
            return new Observable((observer) => {
                observer.next(this.cache.get(url)!);
                observer.complete();
            });
        }

        const headers = new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
        return new Observable((observer) => {
            this.http.get(buildUrl(url), { headers, responseType: 'blob' }).subscribe({
                next: (blob) => {
                    const blobUrl = URL.createObjectURL(blob);
                    this.cache.set(url, blobUrl); // Almacenar en el caché
                    observer.next(blobUrl);
                    observer.complete();
                },
                error: (err) => {
                    observer.error(err);
                },
            });
        });
    }
}