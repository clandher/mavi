import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root',
})
export class ImageHttpClient {
    constructor(
        public authService: AuthService,
        private http: HttpClient
    ) { }

    fetch(url: string): Observable<string> {
        const headers = new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
        return new Observable((observer) => {
            this.http.get(url, { headers, responseType: 'blob' }).subscribe({
                next: (blob) => {
                    const blobUrl = URL.createObjectURL(blob);
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