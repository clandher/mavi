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
                        redirectTo: 'indicadores',
                        pathMatch: 'full'
                    },
                    {
                        path: 'notificaciones',
                        loadComponent: () => import('./components/configuration/notifications.component').then(m => m.NotificationsComponent),
                        data: { breadcrumb: 'Notificaciones' }
                    },
                    {
                        path: 'indicadores',
                        loadComponent: () => import('./components/configuration/indicators.component').then(m => m.IndicatorsComponent),
                        data: { breadcrumb: 'Indicadores' }
                    },
                    {
                        path: 'escuela',
                        loadComponent: () => import('./components/configuration/schools.component').then(m => m.SchoolsComponent),
                        data: { breadcrumb: 'Escuela' }
                    },
                    {
                        path: 'catalogos',
                        loadComponent: () => import('./components/catalogs/catalogs.component').then(m => m.CatalogsComponent),
                        data: { breadcrumb: 'Catálogos' },
                        children: [
                            { path: 'categorias', loadComponent: () => import('./components/configuration/categories.component').then(m => m.CategoriesComponent) },
                            { path: 'tipos-de-actividad', loadComponent: () => import('./components/activity-types/activity-types.component').then(m => m.ActivityTypesComponent) },
                            { path: 'tipos-de-descuento', loadComponent: () => import('./components/discount-types/discount-types.component').then(m => m.DiscountTypesComponent) },
                            { path: 'radars', loadComponent: () => import('./components/radars/radars.component').then(m => m.RadarsComponent) },
                            { path: 'observaciones', loadComponent: () => import('./components/configuration/observations.component').then(m => m.ObservationsComponent) },
                            { path: '', redirectTo: 'categorias', pathMatch: 'full' }
                        ]
                    },
                    {
                        path: 'desarrollo',
                        loadComponent: () => import('./components/configuration/development.component').then(m => m.DevelopmentComponent),
                        data: { breadcrumb: 'Desarrollo' }
                    },

                    {
                        path: 'usuarios',
                        loadComponent: () => import('./components/users/users.component').then(m => m.UsersComponent),
                        data: { breadcrumb: 'Usuarios' }
                    },
                ]
            },
            {
                path: 'estudiantes/nuevo',
                loadComponent: () => import('./components/students/student-edit.component').then(m => m.StudentEditComponent),
                data: { breadcrumb: 'Nuevo Estudiante' }
            },
            {
                path: 'estudiantes/:id',
                loadComponent: () => import('./components/students/student-edit.component').then(m => m.StudentEditComponent),
                data: { breadcrumb: 'Estudiante' },
                children: [
                    {
                        path: '',
                        redirectTo: 'notificaciones',
                        pathMatch: 'full'
                    },
                    {
                        path: 'notificaciones',
                        loadComponent: () => import('./components/configuration/notification-recipient.component').then(m => m.NotificationRecipientComponent),
                        data: { breadcrumb: 'Notificaciones' }
                    },
                    {
                        path: 'info',
                        loadComponent: () => import('./components/students/student-info.component').then(m => m.StudentInfoComponent),
                        data: { breadcrumb: 'Información' }
                    },
                    {
                        path: 'categorias',
                        loadComponent: () => import('./components/students/student-categories.component').then(m => m.StudentCategoriesComponent),
                        data: { breadcrumb: 'Categorías' }
                    },
                    {
                        path: 'radares',
                        loadComponent: () => import('./components/students/student-radars.component').then(m => m.StudentRadarsComponent),
                        data: { breadcrumb: 'Radares' }
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