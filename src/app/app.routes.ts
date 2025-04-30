import { Routes } from '@angular/router';
import { authGuard } from '@app/core/guards/auth.guard';
import { guestGuard } from '@app/core/guards/guest.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./modules/login/login.component').then(m => m.LoginComponent),
        canActivate: [guestGuard]
    },
    {
        path: 'app',
        loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard],
        children: [
            {
                path: 'avatars',
                loadComponent: () => import('./components/avatars/avatars.component').then(m => m.AvatarsComponent),
                title: 'Avatars'
            },
            {
                path: 'students',
                loadComponent: () => import('./components/students/student-list.component').then(m => m.StudentListComponent),
                title: 'Estudiantes'
            },
            {
                path: 'students/new',
                loadComponent: () => import('./components/students/student-edit.component').then(m => m.StudentEditComponent),
                title: 'Nuevo Estudiante',
                canActivate: [authGuard]
            },
            {
                path: 'students/:id/edit',
                loadComponent: () => import('./components/students/student-edit.component').then(m => m.StudentEditComponent),
                title: 'Editar Estudiante'
            },
            {
                path: '',
                redirectTo: 'avatars',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '',
        redirectTo: 'app',
        pathMatch: 'full'
    },
    {
        path: '**',
        loadComponent: () => import('./modules/not-found/not-found.component').then(m => m.NotFoundComponent)
    }
];