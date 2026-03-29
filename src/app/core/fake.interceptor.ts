// fake-backend.interceptor.ts
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

// Datos de usuarios fake
const fakeUsers = [
    { id: '1', email: 'otsubasa', password: '123456', name: 'Tsubasa Ōzora' },
];

export function fakeBackendInterceptor(
    request: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
    const authService = inject(AuthService);

    // 1. Endpoint de login - interceptamos y simulamos respuesta
    if (request.url.endsWith('/api/auth/login') && request.method === 'POST') {
        return handleLogin(request);
    }

    // 2. Endpoint de logout - limpiamos datos localmente
    if (request.url.endsWith('/api/auth/logout') && request.method === 'POST') {
        authService.logout();
        return of(new HttpResponse({ status: 200, body: { success: true } }));
    }

    // 3. Para otras rutas API, primero verificamos el token
    if (request.url.includes('/api/') && !isPublicRoute(request.url)) {
        const token = authService.getToken();

        if (!token || !isValidToken(token)) {
            return throwError(() => new HttpResponse({
                status: 401,
                body: { error: 'No autorizado' }
            }));
        }
    }

    // 4. Continuar con la solicitud normal (o modificada por jwtInterceptor)
    return next(request).pipe(
        // Simulamos un pequeño delay de red para todas las requests
        delay(150)
    );
}

// Función para manejar login
function handleLogin(request: HttpRequest<any>): Observable<HttpResponse<any>> {
    const { email, password } = request.body;
    const user = fakeUsers.find(u => u.email === email && u.password === password);

    if (!user) {
        return throwError(() => new HttpResponse({
            status: 401,
            body: { error: 'Credenciales inválidas' }
        })).pipe(delay(300)); // Delay para error
    }

    const { password: _, ...userData } = user; // Removemos password
    const token = generateFakeToken();

    const body = {
        token,
        user: userData
    };

    return of(new HttpResponse({
        status: 200,
        body,
    })).pipe(delay(500)); // Delay para éxito
}

// Función para verificar rutas públicas
function isPublicRoute(url: string): boolean {
    const publicRoutes = ['/api/auth/login', '/api/auth/register'];
    return publicRoutes.some(route => url.endsWith(route));
}

// Función para validar token (muy básica)
function isValidToken(token: string): boolean {
    return token?.startsWith('fake-jwt-token-');
}

// Función para generar token fake
function generateFakeToken(): string {
    return `fake-jwt-token-${Math.random().toString(36).substr(2)}-${Date.now()}`;
}