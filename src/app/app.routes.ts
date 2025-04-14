import { Routes } from '@angular/router';
import { authGuard } from '@app/core/guards/auth.guard';
import { guestGuard } from '@app/core/guards/guest.guard';

export const routes: Routes = [
    // Ruta de login (pública)
    {
        path: 'login',
        loadComponent: () => import('./modules/auth/login/login.component').then(m => m.LoginComponent),
        canActivate: [guestGuard] // Solo para no autenticados
    },

    // Área privada (dashboard como layout padre)
    {
        path: 'app',
        loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard], // Requiere autenticación
        // children: [
            // {
            //     path: '',
            //     loadComponent: () => import('./modules/dashboard/views/main.component').then(m => m.MainComponent),
            //     title: 'Inicio'
            // },
            // {
            //     path: 'profile',
            //     loadComponent: () => import('./modules/dashboard/views/profile.component').then(m => m.ProfileComponent),
            //     title: 'Perfil'
            // }
        // ]
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