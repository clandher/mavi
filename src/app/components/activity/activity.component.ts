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
    @Input() activityId: number | null = 0;

    @Output() complete = new EventEmitter<boolean>();

    public showModal: boolean = true;
    public activityTypes: ActivityType[] = [];
    public categories: Category[] = [];
    public newActivity: CreateActivityDto = {
        description: '',
        startDate: dateToDatetimeLocalString(new Date()),
        endDate: dateToDatetimeLocalString(new Date()),
        gracePeriod: 0,
        price: 0,
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
        if (this.validateActivity()) {
            // Convertir fechas a Date antes de enviar
            const activityToSave = {
                ...this.newActivity,
                startDate: this.newActivity.startDate,
                endDate: this.newActivity.endDate,
            };
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
            alert('Por favor, complete todos los campos correctamente.');
        }
    }

    validateActivity(): boolean {
        return !!this.newActivity.description &&
            !!this.newActivity.startDate &&
            !!this.newActivity.endDate &&
            this.newActivity.price > 0 &&
            this.newActivity.categoryId > 0 &&
            this.newActivity.typeId > 0;
    }
}
