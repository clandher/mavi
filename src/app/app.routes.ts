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
                path: 'actividades',
                loadComponent: () => import('./components/avatars/avatars.component').then(m => m.AvatarsComponent),
                title: 'Avatars'
            },
            {
                path: 'estudiantes',
                loadComponent: () => import('./components/students/student-list.component').then(m => m.StudentListComponent),
                title: 'Estudiantes'
            },
            {
                path: 'configuración',
                loadComponent: () => import('./components/develop/develop.component').then(m => m.DevelopComponent),
                title: 'Configuración'
            },
            {
                path: 'estudiantes/nuevo',
                loadComponent: () => import('./components/students/student-edit.component').then(m => m.StudentEditComponent),
                title: 'Nuevo Estudiante',
            },
            {
                path: 'estudiantes/:id/editar',
                loadComponent: () => import('./components/students/student-edit.component').then(m => m.StudentEditComponent),
                title: 'Editar Estudiante',
                children: [
                    {
                        path: '',
                        redirectTo: 'info',
                        pathMatch: 'full'
                    },
                    {
                        path: 'info',
                        loadComponent: () => import('./components/students/student-info.component').then(m => m.StudentInfoComponent)
                    },
                    {
                        path: 'actividades',
                        loadComponent: () => import('./components/students/student-activities.component').then(m => m.StudentActivitiesComponent)
                    },
                    {
                        path: 'pagos',
                        loadComponent: () => import('./components/students/student-payments.component').then(m => m.StudentPaymentsComponent)
                    },
                    {
                        path: 'ficha-tecnica',
                        loadComponent: () => import('./components/students/student-technical.component').then(m => m.StudentTechnicalComponent)
                    },
                    {
                        path: 'documentos',
                        loadComponent: () => import('./components/students/student-documents.component').then(m => m.StudentDocumentsComponent)
                    }
                ]
            },
            {
                path: '',
                redirectTo: 'actividades',
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
        redirectTo: 'app',
        pathMatch: 'full'
        // loadComponent: () => import('./modules/not-found/not-found.component').then(m => m.NotFoundComponent)
    }
];