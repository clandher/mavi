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
        loadComponent: () => import('./modules/home/home.component').then(m => m.HomeComponent),
        canActivate: [authGuard],
        children: [
            {
                path: 'actividades',
                loadComponent: () => import('./components/avatars/avatars.component').then(m => m.AvatarsComponent),
                data: { breadcrumb: 'Avatars' }
            },
            {
                path: 'estudiantes',
                loadComponent: () => import('./components/students/student-list.component').then(m => m.StudentListComponent),
                data: { breadcrumb: 'Estudiantes' }
            },
            {
                path: 'configuración',
                loadComponent: () => import('./components/configuration/configuration.component').then(m => m.ConfigurationComponent),
                data: { breadcrumb: 'Configuración' },
                children: [
                    {
                        path: '',
                        redirectTo: 'escuela',
                        pathMatch: 'full'
                    },
                    {
                        path: 'escuela',
                        loadComponent: () => import('./components/configuration/schools.component').then(m => m.SchoolsComponent),
                        data: { breadcrumb: 'Escuela' }
                    },
                    {
                        path: 'desarrollo',
                        loadComponent: () => import('./components/configuration/development.component').then(m => m.DevelopmentComponent),
                        data: { breadcrumb: 'Desarrollo' }
                    },
                    {
                        path: 'categorias',
                        loadComponent: () => import('./components/configuration/categories.component').then(m => m.CategoriesComponent),
                        data: { breadcrumb: 'Categorías' }
                    },
                    {
                        path: 'tipos-de-actividad',
                        loadComponent: () => import('./components/activity-types/activity-types.component').then(m => m.ActivityTypesComponent),
                        data: { breadcrumb: 'Tipos de Actividad' }
                    },
                    {
                        path: 'usuarios',
                        loadComponent: () => import('./components/users/users.component').then(m => m.UsersComponent),
                        data: { breadcrumb: 'Usuarios' }
                    }
                ]
            },
            {
                path: 'estudiantes/nuevo',
                loadComponent: () => import('./components/students/student-edit.component').then(m => m.StudentEditComponent),
                data: { breadcrumb: 'Nuevo Estudiante' }
            },
            {
                path: 'estudiantes/:id/editar',
                loadComponent: () => import('./components/students/student-edit.component').then(m => m.StudentEditComponent),
                data: { breadcrumb: 'Editar Estudiante' },
                children: [
                    {
                        path: '',
                        redirectTo: 'info',
                        pathMatch: 'full'
                    },
                    {
                        path: 'info',
                        loadComponent: () => import('./components/students/student-info.component').then(m => m.StudentInfoComponent),
                        data: { breadcrumb: 'Información' }
                    },
                    {
                        path: 'actividades',
                        loadComponent: () => import('./components/students/student-activities.component').then(m => m.StudentActivitiesComponent),
                        data: { breadcrumb: 'Actividades' }
                    },
                    {
                        path: 'pagos',
                        loadComponent: () => import('./components/students/student-payments.component').then(m => m.StudentPaymentsComponent),
                        data: { breadcrumb: 'Pagos' }
                    },
                    {
                        path: 'ficha-tecnica',
                        loadComponent: () => import('./components/students/student-technical.component').then(m => m.StudentTechnicalComponent),
                        data: { breadcrumb: 'Ficha Técnica' }
                    },
                    {
                        path: 'observaciones',
                        loadComponent: () => import('./components/students/student-observations.component').then(m => m.StudentObservationsComponent),
                        data: { breadcrumb: 'Observaciones' }
                    },
                    {
                        path: 'documentos',
                        loadComponent: () => import('./components/students/student-documents.component').then(m => m.StudentDocumentsComponent),
                        data: { breadcrumb: 'Documentos' }
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