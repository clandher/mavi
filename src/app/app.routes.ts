import { Routes } from '@angular/router';
import { authGuard } from '@app/core/guards/auth.guard';
import { guestGuard } from '@app/core/guards/guest.guard';

export const routes: Routes = [
    // Ruta de login (pública)
    {
        path: 'login',
        loadComponent: () => import('./modules/login/login.component').then(m => m.LoginComponent),
        canActivate: [guestGuard] // Solo para no autenticados
    },

    // Área privada (dashboard como layout padre)
    {
        path: 'app',
        loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard], // Requiere autenticación
        children: [
            {
                path: 'avatars', // Añade una ruta específica
                loadComponent: () => import('./components/avatars/avatars.component').then(m => m.AvatarsComponent),
                title: 'Avatars'
            },
            {
                path: '',
                redirectTo: 'avatars', // Redirige a avatars por defecto
                pathMatch: 'full'
            }
        ]
    },

    // Redirecciones
    {
        path: '',
        redirectTo: 'app', // O 'login' si prefieres
        pathMatch: 'full'
    },
    {
        path: '**',
        loadComponent: () => import('./modules/not-found/not-found.component').then(m => m.NotFoundComponent)
    }
];