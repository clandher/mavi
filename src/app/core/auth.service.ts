import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { BaseHttp } from './base-http';

interface User {
    id: string;
    name: string;
    email: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private _currentUser = signal<User | null>(null);

    constructor(private http: HttpClient, private router: Router) {
        this._loadUserFromStorage();
    }

    private _loadUserFromStorage(): void {
        const userData = localStorage.getItem('user_data');
        if (userData) {
            try {
                this._currentUser.set(JSON.parse(userData));
            } catch (e) {
                console.error('Error parsing user data', e);
                this._clearAuthData();
            }
        }
    }

    private _clearAuthData(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        this._currentUser.set(null);
    }

    get currentUser(): User | null {
        return this._currentUser();
    }

    // Ejemplo de login tipado
    login(credentials: { email: string; password: string }): Observable<any> {

        const authLogin = new BaseHttp('auth/login', this.http);
        return authLogin.post(credentials).pipe(
            tap((response: any) => {
                // Guardar token y redirigir
                localStorage.setItem('auth_token', response.token);
                localStorage.setItem('user_data', JSON.stringify(response.user));
                this._loadUserFromStorage();
                this.router.navigate(['/app']);
            })
        );
    }

    logout(): void {
        this._clearAuthData();
        this.router.navigate(['/login']);
    }

    isAuthenticated(): boolean {
        return !!this._currentUser() || !!localStorage.getItem('auth_token');
    }

    getToken(): string | null {
        // Implementación segura que retorna string o null
        return localStorage.getItem('auth_token');
    }

}