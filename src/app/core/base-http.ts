import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


export const baseUrl = environment.apiUrl;

export function buildUrl(path: string): string {
    return `${baseUrl}/${path}`;
}

export class BaseHttp {
    private readonly url: string;

    constructor(private path: string, protected http: HttpClient) {
        this.url = buildUrl(this.path);
    }

    sub(subPath: string): BaseHttp {
        return new BaseHttp(`${this.path}/${subPath}`, this.http);
    }

    get<TResponse>(params?: HttpParams | { [key: string]: any }): Observable<TResponse> {
        return this.http.get<TResponse>(this.url, { params });
    }

    post<TRequest, TResponse>(body: TRequest): Observable<TResponse> {
        return this.http.post<TResponse>(this.url, body);
    }

    // put<TRequest, TResponse>(body: TRequest): Observable<TResponse> {
    //     return this.http.put<TResponse>(this.url, body);
    // }

    patch<TRequest, TResponse>(id: string | number, body: TRequest): Observable<TResponse> {
        return this.http.patch<TResponse>(`${this.url}/${id}`, body);
    }

    delete<TResponse>(id: string | number): Observable<TResponse> {
        return this.http.delete<TResponse>(`${this.url}/${id}`);
    }
}