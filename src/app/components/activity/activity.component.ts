import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseHttp, buildUrl } from '@app/core/base-http';
import { Activity, ActivityType, CreateActivityDto, Category } from '@app/core/dto';
import { formatDateForDisplay, dateToDatetimeLocalString, datetimeLocalStringToDate } from '@app/core/helpers';

@Component({
    selector: 'app-activity',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './activity.component.html',
    styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit {
    public todayDatetimeLocal: string = dateToDatetimeLocalString(new Date());
    @Input() activityId: number | null = 0;

    @Output() complete = new EventEmitter<boolean>();

    public showModal: boolean = true;
    public activityTypes: ActivityType[] = [];
    public categories: Category[] = [];
    public newActivity: CreateActivityDto = {
        description: 'Nueva actividad...',
        startDate: dateToDatetimeLocalString(new Date()),
        endDate: dateToDatetimeLocalString(new Date(Date.now() + 60 * 60 * 1000)),
        gracePeriod: 15,
        price: 200,
        categoryId: 0,
        typeId: 2,
    };
    public isEdit: boolean = false;

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
        this.isEdit = this.activityId !== 0;
        this.loadCategories();
        this.loadActivityTypes();

        if (this.activityId && this.activityId > 0) {
            this.loadActivity(this.activityId);
        }
    }

    loadCategories() {
        const categoriesAPI = new BaseHttp('categories', this.http);
        categoriesAPI.get<Category[]>().subscribe(result => {
            this.categories = result;
            if (!this.isEdit && this.categories.length > 0) {
                this.newActivity.categoryId = this.categories[0].id;
            }
        });
    }

    loadActivityTypes() {
        const activityTypesAPI = new BaseHttp('activity-types', this.http);
        activityTypesAPI.get<ActivityType[]>().subscribe(result => {
            this.activityTypes = result;
        });
    }

    loadActivity(id: number) {
        const activityAPI = new BaseHttp(`activities/${id}`, this.http);
        activityAPI.get<Activity>().subscribe(result => {
            this.newActivity = {
                description: result.description,
                startDate: dateToDatetimeLocalString(new Date(result.startDate)),
                endDate: dateToDatetimeLocalString(new Date(result.endDate)),
                gracePeriod: result.gracePeriod,
                price: result.price,
                categoryId: result.categoryId,
                typeId: result.typeId
            };
        });
    }

    closeModal(): void {
        this.showModal = false;
        this.complete.emit(true);
    }


    saveActivity(): void {
        const validationResult = this.validateActivity();
        if (validationResult === true) {
            // Convertir fechas a Date antes de enviar
            const activityToSave = {
                ...this.newActivity,
                startDate: this.newActivity.startDate,
                endDate: this.newActivity.endDate,
            };

            activityToSave.typeId = Number(activityToSave.typeId);
            activityToSave.categoryId = Number(activityToSave.categoryId);

            if (this.isEdit) {
                // Actualizar actividad existente
                const activitiesAPI = new BaseHttp(`activities/${this.activityId}`, this.http);
                activitiesAPI.patch<CreateActivityDto, Activity>(activityToSave).subscribe({
                    next: () => this.closeModal(),
                    error: (err) => console.error('Error al actualizar la actividad:', err)
                });
            } else {
                // Crear nueva actividad
                const activitiesAPI = new BaseHttp('activities', this.http);
                activitiesAPI.post<CreateActivityDto, Activity>(activityToSave).subscribe({
                    next: () => this.closeModal(),
                    error: (err) => console.error('Error al crear la actividad:', err)
                });
            }
        } else {
            alert(validationResult);
        }
    }

    validateActivity(): true | string {
        if (!this.newActivity.description) {
            return 'La descripción es obligatoria.';
        }
        if (!this.newActivity.startDate) {
            return 'La fecha de inicio es obligatoria.';
        }
        if (!this.newActivity.endDate) {
            return 'La fecha de fin es obligatoria.';
        }
        if (this.newActivity.price <= 0) {
            return 'El precio debe ser mayor a 0.';
        }
        if (this.newActivity.categoryId <= 0) {
            return 'Debe seleccionar una categoría válida.';
        }
        if (this.newActivity.typeId <= 0) {
            return 'Debe seleccionar un tipo de actividad válido.';
        }

        // Validar que la fecha de fin sea mayor a la fecha de inicio
        const start = new Date(this.newActivity.startDate);
        const end = new Date(this.newActivity.endDate);
        if (end <= start) {
            return 'La fecha de fin debe ser mayor a la fecha de inicio.';
        }

        return true;
    }
}
