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
                title: 'Avatars'
            },
            {
                path: 'estudiantes',
                loadComponent: () => import('./components/students/student-list.component').then(m => m.StudentListComponent),
                title: 'Estudiantes'
            },
            {
                path: 'configuración',
                loadComponent: () => import('./components/configuration/configuration.component').then(m => m.ConfigurationComponent),
                title: 'Configuración',
                children: [
                    {
                        path: '',
                        redirectTo: 'escuela',
                        pathMatch: 'full'
                    },
                    {
                        path: 'escuela',
                        loadComponent: () => import('./components/configuration/schools.component').then(m => m.SchoolsComponent)
                    },
                    {
                        path: 'desarrollo',
                        loadComponent: () => import('./components/configuration/development.component').then(m => m.DevelopmentComponent)
                    },
                    {
                        path: 'categorias',
                        loadComponent: () => import('./components/configuration/categories.component').then(m => m.CategoriesComponent)
                    },
                    {
                        path: 'tipos-de-actividad',
                        loadComponent: () => import('./components/activity-types/activity-types.component').then(m => m.ActivityTypesComponent)
                    }
                ]
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