import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


export const baseUrl = 'http://localhost:3000';

export function buildUrl(path: string): string {
    return `${baseUrl}/${path}`;
}

export class BaseHttp {

    constructor(private path: string, protected http: HttpClient) { }

    get<TResponse>(params?: HttpParams | { [key: string]: any }): Observable<TResponse> {
        const url = buildUrl(this.path);
        return this.http.get<TResponse>(url, { params });
    }

    post<TRequest, TResponse>(body: TRequest): Observable<TResponse> {
        const url = buildUrl(this.path);
        return this.http.post<TResponse>(url, body);
    }

    put<TRequest, TResponse>(body: TRequest): Observable<TResponse> {
        const url = buildUrl(this.path);
        return this.http.put<TResponse>(url, body);
    }

    patch<TRequest, TResponse>(body: TRequest): Observable<TResponse> {
        const url = buildUrl(this.path);
        return this.http.patch<TResponse>(url, body);
    }

    delete<TResponse>(): Observable<TResponse> {
        const url = buildUrl(this.path);
        return this.http.delete<TResponse>(url);
    }
}